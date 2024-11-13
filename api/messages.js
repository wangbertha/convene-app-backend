const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");
const { authenticate } = require("./auth");

// POST new message
router.post("/", authenticate, async (req, res, next) => {
  const { chatId, senderId, text } = req.body;

  if (!chatId || !senderId || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const message = await prisma.message.create({
      data: {
        chat: { connect: { id: chatId } },
        senderId,
        text,
      },
    });

    res.status(200).json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// GET messages by id
router.get("/:id", authenticate, async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
});
