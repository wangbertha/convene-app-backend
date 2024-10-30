const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");
const { authenticate } = require("./auth");

//get all events
router.get("/", async (req, res, next) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
  } catch (e) {
    next(e);
  }
});

//event:id routes
router
  .route("/:id")
  //get event:id
  .get(async (req, res, next) => {
    try {
      res.json(req.event);
    } catch (e) {
      next(e);
    }
  })
  //AUTH update event:id (add attendees)
  .post(authenticate, async (req, res, next) => {
    //post current user to attendingUser
    try {
      const event = await prisma.event.update({
        where: {
          id: req.body.eventId,
        },
        data: {
          attendingUsers: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    } catch (e) {
      next(e);
    }
  })

  //remove current user from attendingUser
  .post(authenticate, async (req, res, next) => {
    try {
      const event = await prisma.event.update({
        where: {
          id: req.body.eventId,
        },
        data: {
          attendingUsers: {
            disconnect: {
              id: user.id,
            },
          },
        },
      });
    } catch (e) {
      next(e);
    }
  });
