const { Server } = require("socket.io");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // Join a room
    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`Client joined room: ${room}`);
    });

    // Send message to a room
    socket.on("send_message", ({ room, message, timestamp, sender }) => {
      io.to(room).emit("receive_message", { message, timestamp, sender });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
