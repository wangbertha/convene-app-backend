const { Server } = require("socket.io");

function initializeSocket(server) {
    const io = new Server(server, { cors: { origin: "*" } });
    
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        
        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
        });
        
        socket.on("send_message", (message) => {
            io.to(message.receiverId).emit("new_message", message);
        });
        
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
    
    return io;
}

module.exports = initializeSocket;