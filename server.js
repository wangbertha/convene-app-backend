const express = require("express");
const { createServer } = require("http");
const initializeSocketIO = require("./socket");
require("dotenv").config();

const app = express();
const server = createServer(app);
const PORT = 3000;

// cors
const URL = "http://localhost:5173";
const cors = require("cors");
app.use(cors({ origin: URL }));

app.use(require("morgan")("dev"));
app.use(express.json());

// Endpoint routing middleware
app.use(require("./api/auth").router);
app.use("/interests", require("./api/interests"));
app.use("/activities", require("./api/activities"));
app.use("/users", require("./api/users"));
app.use("/chats", require("./api/chats"));
app.use("/messages", require("./api/messages"));

// Error-handling middleware
app.use((req, res, next) => {
  next({ status: 404, message: "Endpoint not found." });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500);
  res.json(err.message ?? "Sorry, something broke :(");
});

// Initialize socket.IO with server
const io = initializeSocketIO(server);

// Start server with socket.io
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
