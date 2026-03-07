require("dotenv").config();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const app = require("./src/app");
const server = http.createServer(app);

app.use(cors());

// OT functions (Ensure these exist in your src/ot/textOt.js)
const { applyOp, transform } = require("./src/ot/textOt");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// User Mapping (Socket ID -> Username)
const userSocketMap = {};

// ✅ NEW: File structures track karne ke liye (Folder/File Sync)
const roomFileTrees = new Map();

// ✅ UPDATED: Ab har file ka apna alag data hoga (Key: roomId_fileId)
const roomDocs = new Map();

function getOrCreateFileDoc(roomId, fileId) {
  const key = `${roomId}_${fileId}`;
  if (!roomDocs.has(key)) {
    roomDocs.set(key, {
      text: "",
      version: 0,
      history: [],
      historyStartVersion: 1,
      language: "javascript",
    });
  }
  return roomDocs.get(key);
}

function getAllConnectedClients(roomId) {
  const roomClients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
  return roomClients.map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected 🟢"))
  .catch((err) => console.log("MongoDB Error 🔴", err));

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // ✅ SMART JOIN LOGIC
  socket.on("join", ({ roomId, username }) => {
    if (!username) return; // Failsafe

    const clients = getAllConnectedClients(roomId);
    const existingClient = clients.find(
      (client) => client.username === username,
    );

    // Agar purana connection atka hua hai, usko forcefully hatao
    if (existingClient) {
      const oldSocket = io.sockets.sockets.get(existingClient.socketId);
      if (oldSocket) {
        oldSocket.leave(roomId); // Room se nikalo
        delete userSocketMap[oldSocket.id]; // Map se hatao

        // Baki users ko notify karo ki purana instance gaya
        socket.in(roomId).emit("disconnected", {
          socketId: oldSocket.id,
          username: username,
        });
      }
    }

    // Ab naye connection ko aaram se map karo
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    // ✅ NEW: Jab naya user aaye, toh usko existing files aur folders dikhao
    if (roomFileTrees.has(roomId)) {
      socket.emit("file_structure_update", roomFileTrees.get(roomId));
    }

    // Broadcast to EVERYONE in the room so the sidebar updates instantly
    const updatedClients = getAllConnectedClients(roomId);
    io.in(roomId).emit("joined", {
      clients: updatedClients,
      username,
      socketId: socket.id,
    });
  });

  // ✅ NEW: Jab koi Admin nayi file/folder banaye toh sabko update bhejo
  socket.on("file_structure_change", ({ roomId, files }) => {
    if (!roomId) return;
    roomFileTrees.set(roomId, files); // Server par save karo
    socket.to(roomId).emit("file_structure_update", files); // Doosre users ko dikhao
  });

  // ✅ NEW: Jab user dusri file par click kare toh us file ka latest code bhejo
  socket.on("request_file_sync", ({ roomId, fileId }) => {
    if (!roomId || !fileId) return;
    const doc = getOrCreateFileDoc(roomId, fileId);
    socket.emit("doc_init", {
      fileId,
      text: doc.text,
      version: doc.version,
      language: doc.language,
    });
  });

  // ✅ UPDATED: OT Logic ab sirf specific 'fileId' ke liye kaam karegi
  socket.on("ot_op", ({ roomId, fileId, op, baseVersion }) => {
    if (!roomId || !fileId || !op) return;

    const doc = getOrCreateFileDoc(roomId, fileId);
    let incoming = op;
    const base = Number.isFinite(baseVersion) ? baseVersion : doc.version;

    if (base < (doc.historyStartVersion || 0) - 1) {
      return socket.emit("doc_init", {
        fileId,
        text: doc.text,
        version: doc.version,
        language: doc.language,
      });
    }

    doc.history.forEach((hist) => {
      if (hist.version > base) {
        incoming = transform(incoming, hist.op);
      }
    });

    doc.text = applyOp(doc.text, incoming);
    doc.version += 1;
    doc.history.push({ version: doc.version, op: incoming });

    if (doc.history.length > 200) {
      doc.history.splice(0, doc.history.length - 200);
      doc.historyStartVersion = doc.history[0].version;
    }

    // ✅ Emit karte waqt fileId sath bhejo taaki galat file me type na ho
    io.to(roomId).emit("ot_applied", {
      fileId,
      op: incoming,
      version: doc.version,
      authorSocketId: socket.id,
    });
  });

  // ✅ Language Sync logic (File specific)
  socket.on("language_change", ({ roomId, fileId, language }) => {
    if (roomId && fileId) {
      const doc = getOrCreateFileDoc(roomId, fileId);
      doc.language = language;
    }
    io.to(roomId).emit("language_changed", { language, fileId });
  });

  // ✅ Disconnect logic
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });

      // Cleanup logic if room is empty
      if (roomId !== socket.id) {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room || room.size <= 1) {
          // Clear memory for this room's files
          roomFileTrees.delete(roomId);
          for (let key of roomDocs.keys()) {
            if (key.startsWith(roomId + "_")) {
              roomDocs.delete(key);
            }
          }
        }
      }
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`SERVER RUNNING ON PORT ${PORT} 🚀`);
});
