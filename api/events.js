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
  .put(authenticate, async (req, res, next) => {
    //TODO: update event for attendees
  });
