const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const messages = await prisma.chat.findMany({
            where: {
                OR: [
                    { senderId: parseInt(id) },
                    { receiverId: parseInt(id) }
                ]
            },
            orderBy: { createdAt: "asc" }
        });
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to retrieve messages" });
    }
});

router.post("/", async (req, res) => {
    const { senderId, receiverId, content } = req.body;

    try {
        
        const newMessage = await prisma.chat.create({
            data: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                content,
                isRead: false, 
                messageType: "text"
            }
        });
        res.json(newMessage);
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: "Failed to save message" });
    }
});

module.exports = router;
