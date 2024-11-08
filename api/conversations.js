const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// Get all conversations for a user
router.get("/:userId", async (req, res, next) => {
  const userId = parseInt(req.params.userId); // Get userId from URL params

  try {
    // Fetch all conversations where the user is either the sender or receiver
    const conversations = await prisma.chat.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        createdAt: "desc" 
      }
    });

    // If no conversations found, return empty array
    if (!conversations) {
      return res.status(404).json({ message: "No conversations found" });
    }

    res.status(200).json(conversations);
  } catch (error) {
    console.error(error);
    next({ status: 500, message: "Error retrieving conversations" });
  }
});

module.exports = router;