require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const app = require("./src/app"); 
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// User Mapping (Socket ID -> Username)
const userSocketMap = {};

function getAllConnectedClients(roomId) {
  // Room ke saare socket IDs nikalo aur unhe username ke sath map karo
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    },
  );
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected 🟢"))
  .catch((err) => console.log("MongoDB Error 🔴", err));

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // Jab user join kare (Username ke sath)
  socket.on("join", ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    // Room mein maujood sabhi logo ko naye user ki list bhejo
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("joined", {
        clients,
        username, // Kisne join kiya
        socketId: socket.id,
      });
    });
  });

  // Code Synchronization
  socket.on("code_change", ({ roomId, code }) => {
    socket.in(roomId).emit("receive_code", code);
  });

  // Disconnecting logic (Before actual disconnect)
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT} 🚀`);
});
