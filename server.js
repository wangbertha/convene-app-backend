const express = require("express");
const { createServer } = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = createServer(app);
const io = socketIo(server); // Initialize socket.io with the HTTP server

const PORT = process.env.PORT || 3000;

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

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start server with socket.io
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
