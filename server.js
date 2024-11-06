const express = require("express");
const app = express();
const PORT = 3000;
require("dotenv").config();
const initializeSocket = require("./socket"); 

//cors
const cors = require("cors");
app.use(cors({ origin: /localhost/ }));

app.use(require("morgan")("dev"));
app.use(express.json());

app.use(require("./api/auth").router);
app.use("/interests", require("./api/interests"));
app.use("/events", require("./api/events"));
app.use("/users", require("./api/users"));
app.use("/messages", require("./api/messages"));
app.use("/conversations", require("./api/conversations"));

app.use((req, res, next) => {
  next({ status: 404, message: "Endpoint not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500);
  res.json(err.message ?? "Sorry, something broke :(");
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

initializeSocket(server);