require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const app = require("./src/app");
const server = http.createServer(app);

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
// Document State Mapping
const roomDocs = new Map();

function getOrCreateRoomDoc(roomId) {
  if (!roomDocs.has(roomId)) {
    roomDocs.set(roomId, {
      text: "",
      version: 0,
      history: [],
      historyStartVersion: 1,
      language: "javascript",
    });
  }
  return roomDocs.get(roomId);
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

  // ✅ SMART JOIN LOGIC: Fixes the Leave & Rejoin "Ghost" Issue
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

    // Send initial document state
    const doc = getOrCreateRoomDoc(roomId);
    socket.emit("doc_init", {
      text: doc.text,
      version: doc.version,
      language: doc.language,
    });

    // Broadcast to EVERYONE in the room so the sidebar updates instantly
    const updatedClients = getAllConnectedClients(roomId);
    io.in(roomId).emit("joined", {
      clients: updatedClients,
      username,
      socketId: socket.id,
    });
  });

  // ✅ OT-based code sync logic
  socket.on("ot_op", ({ roomId, op, baseVersion }) => {
    if (!roomId || !op) return;

    const doc = getOrCreateRoomDoc(roomId);
    let incoming = op;
    const base = Number.isFinite(baseVersion) ? baseVersion : doc.version;

    if (base < (doc.historyStartVersion || 0) - 1) {
      return socket.emit("doc_init", {
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

    io.to(roomId).emit("ot_applied", {
      op: incoming,
      version: doc.version,
      authorSocketId: socket.id,
    });
  });

  // ✅ Language Sync logic
  socket.on("language_change", ({ roomId, language }) => {
    const doc = getOrCreateRoomDoc(roomId);
    doc.language = language;
    io.to(roomId).emit("language_changed", { language });
  });

  // ✅ Disconnect logic
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });

      if (roomId !== socket.id) {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room || room.size <= 1) roomDocs.delete(roomId);
      }
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT} 🚀`);
});
