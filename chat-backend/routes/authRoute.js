const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Register route
router.post("/register", register);
// Login Route
router.post("/login", login);
// Logout Route
router.post("/logout", protect, logout);

module.exports = router;
