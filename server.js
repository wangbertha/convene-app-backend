const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = createServer(app);
const PORT = 3000;

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// cors
const cors = require("cors");
app.use(cors({ origin: /localhost/ }));

app.use(require("morgan")("dev"));
app.use(express.json());

app.use(require("./api/auth").router);
app.use("/interests", require("./api/interests"));
app.use("/events", require("./api/events"));
app.use("/users", require("./api/users"));

app.use((req, res, next) => {
  next({ status: 404, message: "Endpoint not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500);
  res.json(err.message ?? "Sorry, something broke :(");
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected");

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
    console.log("Client disconnected");
  });
});

// Start server with socket.io
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
