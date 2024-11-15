const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");
const { authenticate } = require("./auth");

// GET all activities
router.get("/", async (req, res, next) => {
  try {
    const activities = await prisma.activity.findMany({
      include: { users: true },
    });
    res.json(activities);
  } catch (e) {
    next(e);
  }
});

// GET activity by id
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const activity = await prisma.activity.findUniqueOrThrow({
      where: { id: +id },
      include: { users: true },
    });
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

// PATCH activity by id to connect or disconnect current user
router.patch("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { saved } = req.body;

  try {
    const activity = await prisma.activity.update({
      where: {
        id: +id,
      },
      data: {
        users: saved
          ? {
              connect: {
                id: req.user.id,
              },
            }
          : {
              disconnect: {
                id: req.user.id,
              },
            },
      },
    });
    res.status(201).json(activity);
  } catch (e) {
    next(e);
  }
});
