const express = require("express");
const router = express.Router();

const {
  getChats,
  getChat,
  sendMessage,
  createDirectChat,
} = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

// Get all chats for current user
router.get("/", protect, getChats);

// Get specific chat
router.get("/:chatId", protect, getChat);

// Send message in chat
router.post("/:chatId/message", protect, sendMessage);

// Create direct chat - ONLY POST, NO GET
router.post("/direct/:userId", protect, createDirectChat);

module.exports = router;
