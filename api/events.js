const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");
const { authenticate } = require("./auth");

//get all events
router.get("/", async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      include: { attendingUsers: true },
    });
    res.json(events);
  } catch (e) {
    next(e);
  }
});

//event:id routes
router.get("/:id/", async (req, res, next) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUniqueOrThrow({
      where: { id: +id },
      include: { attendingUsers: true },
    });
    res.json(event);
  } catch (e) {
    next(e);
  }
});
//AUTH update event:id (add attendees)

router.patch("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { attending } = req.body;

  try {
    //const user = userId.map((id) => ({ id }));
    const event = await prisma.event.update({
      where: {
        id: +id,
      },
      data: {
        attendingUsers: attending
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
    res.status(201).json(event);
  } catch (e) {
    next(e);
  }
});

//remove current user from attendingUser
router.delete("/:id/attendingUsers", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.update({
      where: {
        id: +id,
      },
      data: {
        attendingUsers: {
          disconnect: {
            id: req.user.id,
          },
        },
      },
    });
    res.status(200).json(event);
  } catch (e) {
    next(e);
  }
});
