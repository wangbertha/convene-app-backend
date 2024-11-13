const express = require("express");
const router = express.Router();

const prisma = require("../prisma");

// Import jwt and JWT_SECRET from .env
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Create token
function createToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" });
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register new user
router.post("/register", async (req, res, next) => {
  const { email, password, firstname } = req.body;
  try {
    if (!email || !password) {
      return next({ status: 400, message: "email and password are required." });
    }

    if (!firstname) {
      return next({ status: 400, message: "firstname is required." });
    }

    if (email.trim() === "" || password.trim() === "") {
      return next({
        status: 400,
        message: "email and password cannot be empty.",
      });
    }

    if (!emailRegex.test(email)) {
      return next({ status: 400, message: "email format is invalid." });
    }

    if (email.includes(" ") || password.includes(" ")) {
      return next({
        status: 400,
        message: "email and password cannot contain spaces.",
      });
    }

    const user = await prisma.user.register(email, password, firstname);
    const token = createToken(user.id);
    res.status(201).json({ token });
  } catch (e) {
    next(e);
  }
});

// Login user
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next({ status: 400, message: "email and password are required." });
    }

    if (!emailRegex.test(email)) {
      return next({ status: 400, message: "email format is invalid." });
    }

    if (email.trim() === "" || password.trim() === "") {
      return next({
        status: 400,
        message: "email and password cannot be empty.",
      });
    }

    if (email.includes(" ") || password.includes(" ")) {
      return next({
        status: 400,
        message: "email and password cannot contain spaces.",
      });
    }

    const user = await prisma.user.login(email, password);
    const token = createToken(user.id);
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

// Token checking middleware
router.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);

  if (!token) {
    return next();
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
});

// Authenticate function that gets exported to routes
function authenticate(req, res, next) {
  if (req.user) {
    next();
  } else {
    next({ status: 401, message: "You must be logged in." });
  }
}

module.exports = {
  router,
  authenticate,
};
