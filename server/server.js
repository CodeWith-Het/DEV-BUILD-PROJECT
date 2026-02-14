require("dotenv").config(); // ✅ CHANGE 1: Ye line sabse upar zaroori hai

const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const app = require("../server/src/app"); // ✅ CHANGE 2: Path fix kiya (Agar app.js same folder me hai)
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// ✅ CHANGE 3: Options object hata diya (Jo error de raha tha)
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected 🟢"))
  .catch((err) => console.log("MongoDB Error 🔴", err));

// Socket Logic
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("code_change", ({ roomId, code }) => {
    socket.in(roomId).emit("receive_code", code);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT} 🚀`);
});
