const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const { authenticate } = require("./auth");

module.exports = router;

router.get("/", async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            include: { 
                attendingEvents: true, 
                interests: true, 
                connectToUsers: true, 
                connectFromUsers: true, 
                notConnectToUsers: true, 
                notConnectFromUsers: true,  
                sentChats: true,
                receivedChats: true,
            },
        });
        res.status(200).json(users);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return next({ status: 400, message: "Invalid user ID" });
    }

    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: { id: +id },
            include: { 
                attendingEvents: true, 
                interests: true, 
                connectToUsers: true, 
                connectFromUsers: true, 
                notConnectToUsers: true, 
                notConnectFromUsers: true,  
                sentChats: true,
                receivedChats: true,
            },
        });
        res.json(user);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.patch("/:id", authenticate, async (req, res, next) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return next({ status: 400, message: "Invalid user ID" });
    }

    if (req.user.id !== +id) {
        return next({ status: 403, message: "Forbidden" });
    }

    const { 
        email, 
        firstname, 
        lastname, 
        profilePicture, 
        bio, 
        city, 
        state, 
        age, 
        gender, 
        genderPreference, 
        lookingFor, 
        profileActive 
    } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: +id },
            data: {
                // using "spread operator" and the "logical AND" to add variable if "truthy"
                ...(email && { email }),
                ...(firstname && { firstname }),
                ...(lastname && { lastname }),
                ...(profilePicture && { profilePicture }),
                ...(bio && { bio }),
                ...(city && { city }),
                ...(state && { state }),
                ...(age !== undefined && { age }),  // allow 0 or null for age if desired
                ...(gender && { gender }),
                ...(genderPreference && { genderPreference }),
                ...(lookingFor && { lookingFor }),
                ...(profileActive && { profileActive }),
            },
        });
        res.status(200).json(user);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.delete("/:id", authenticate, async (req, res, next) => {
    const { id } = req.params;

    if (req.user.id !== +id) {
        return next({ status: 403, message: "Forbidden" });
    }

    try {
        await prisma.user.delete({
            where: { id: +id },
        });
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        next(e);
    }
});
