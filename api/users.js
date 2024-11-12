const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const { authenticate } = require("./auth");

module.exports = router;

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      },
    });
    res.status(200).json(users);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user.id },
      include: {
        interests: true,
        attendingEvents: true,
        connectToUsers: true,
        connectFromUsers: true,
        notConnectToUsers: true,
        notConnectFromUsers: true,
      },
    });
    res.json(user);
  } catch (e) {
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
      },
    });
    res.json(user);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.patch("/me", authenticate, async (req, res, next) => {
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
    profileActive,
    interestToConnect,
    interestToDisconnect,
  } = req.body;

  // email check validation

  if (email !== undefined) {
    if (email.trim() === "") {
      return next({
        status: 400,
        message: "email cannot be empty.",
      });
    }

    if (email.includes(" ")) {
      return next({
        status: 400,
        message: "email cannot contain spaces.",
      });
    }

    if (!emailRegex.test(email)) {
      return next({ status: 400, message: "email format is invalid." });
    }
  }

  // firstname check validation
  if (firstname !== undefined) {
    if (firstname.trim() === "") {
      return next({
        status: 400,
        message: "firstname cannot be empty.",
      });
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        email,
        firstname,
        lastname,
        profilePicture,
        bio,
        city,
        state,
        age: +age,
        gender,
        genderPreference,
        lookingFor,
        profileActive,
        interests: {
          ...(interestToConnect && { connect: [{ id: interestToConnect.id }] }),
          ...(interestToDisconnect && {
            disconnect: [{ id: interestToDisconnect.id }],
          }),
        },
      },
    });
    res.status(200).json(user);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.delete("/me", authenticate, async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });
    res.sendStatus(204);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.patch("/me/password", authenticate, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next({
      status: 400,
      message: "Both current and new passwords are required.",
    });
  }

  try {
    const updatedUser = await prisma.user.updatePassword(
      req.user.id,
      currentPassword,
      newPassword
    );
    res.status(200).json({ message: "Password updated successfully" });
  } catch (e) {
    if (e.message === "Current password is incorrect.") {
      return next({ status: 400, message: e.message });
    }
    console.error(e);
    next(e);
  }
});
