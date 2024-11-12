const { Server } = require("socket.io");

function initializeSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  let onlineUsers = [];

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Listen for user to add to onlineUsers
    socket.on("addNewUser", (userId) => {
      if (userId && !onlineUsers.some((user) => user.userId === userId)) {
        onlineUsers.push({
          userId,
          socketId: socket.id,
        });
      }
      console.log("Online users:", onlineUsers);

      // Sends the online users to the client
      io.emit("getOnlineUsers", onlineUsers);

      //Lisents for a message and emits that message to the online user
      //that has the new message recipient id
      socket.on("sendMessage", (message) => {
        // Find the recipient user by their userId
        const recipient = onlineUsers.find(
          (user) => user.userId === message.recipientId
        );

        if (recipient) {
          // Emit the message only to the recipient's socket
          io.to(recipient.socketId).emit("getMessage", message);
        }
      });

      // On user disconnect, it takes the user out of the onluneUsers
      // array
      socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("getOnlineUsers", onlineUsers);
      });
    });
  });

  return io;
}

module.exports = initializeSocketIO;
