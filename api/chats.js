const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");
const { authenticate } = require("./auth");

// Create a chat between 2 users
router.post("/", authenticate, async (req, res, next) => {
  const { firstId, secondId } = req.body;
  try {
    const existingChat = await prisma.chat.findFirst({
      where: {
        members: {
          hasEvery: [firstId, secondId],
        },
      },
    });

    if (existingChat) return res.status(201).json(existingChat);

    const newChat = await prisma.chat.create({
      data: {
        members: [firstId, secondId],
      },
    });

    return res.status(201).json(newChat);
  } catch (error) {
    next(error);
  }
});

// Get all chats for a specific user
router.get("/user-chats", authenticate, async (req, res, next) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { members: { has: req.user.id } },
      include: { messages: true },
    });

    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
});

router.get("/", authenticate, async (req, res, next) => {
  const { firstId, secondId } = req.body;
  try {
    const existingChat = await prisma.chat.findFirst({
      where: {
        members: {
          hasEvery: [firstId, secondId],
        },
      },
      include: { messages: true },
    });

    if (!existingChat)
      return res.status(404).json({ message: "Chat not found" });

    res.status(200).json(existingChat);
  } catch (error) {
    next(error);
  }
});
