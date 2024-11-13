const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");

// GET all interests
router.get("/", async (req, res, next) => {
    try {
        const interests = await prisma.interest.findMany();
        res.json(interests);
    } catch (e) {
        next(e);
    }
});

// POST new interest
router.post("/", async (req, res, next) => {
    const { interest } = req.body;
    try {
        const newInterest = await prisma.interest.create({
            data: { interest },
        });
        res.status(201).json(newInterest);
    } catch (e) {
        next(e);
    }
});