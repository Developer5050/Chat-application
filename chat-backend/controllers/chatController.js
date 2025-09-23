const mongoose = require("mongoose");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Invite = require("../models/inviteModel");

// Get all chats for current user
const getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      participants: userId,
      isActive: true,
    })
      .populate("participants", "username email")
      .populate("messages.sender", "username")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats: chats.map((chat) => ({
        _id: chat._id,
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        type: chat.type,
        messageCount: chat.messages.length,
        updatedAt: chat.updatedAt,
        unreadCount: 0, // You can implement this later
      })),
    });
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get specific chat with messages
const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
      isActive: true,
    })
      .populate("participants", "username email")
      .populate("messages.sender", "username");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({
      success: true,
      chat: {
        _id: chat._id,
        participants: chat.participants,
        messages: chat.messages,
        type: chat.type,
        name: chat.name,
        lastMessage: chat.lastMessage,
        createdAt: chat.createdAt,
      },
    });
  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send message in chat
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Message text is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    // Verify user is participant in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
      isActive: true,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const newMessage = {
      sender: userId,
      text: text.trim(),
      createdAt: new Date(),
    };

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: newMessage },
        $set: { lastMessage: text.trim() },
      },
      { new: true }
    )
      .populate("participants", "username email")
      .populate("messages.sender", "username");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create direct chat (without invite system)
const createDirectChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId === currentUserId) {
      return res
        .status(400)
        .json({ message: "Cannot create chat with yourself" });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] },
      type: "direct",
      isActive: true,
    });

    if (existingChat) {
      return res.status(400).json({ message: "Chat already exists" });
    }

    // Check if users are contacts
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.contacts.includes(userId)) {
      return res.status(400).json({
        message: "User is not in your contacts. Send an invite first.",
      });
    }

    // Create new chat
    const chat = await Chat.create({
      participants: [currentUserId, userId],
      type: "direct",
      messages: [],
      lastMessage: "Chat started!",
    });

    const populatedChat = await Chat.findById(chat._id).populate(
      "participants",
      "username email"
    );

    res.status(201).json({
      success: true,
      message: "Direct chat created successfully",
      chat: populatedChat,
    });
  } catch (error) {
    console.error("Create direct chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get or create direct chat (convenience method)
const getOrCreateDirectChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if direct chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] },
      type: "direct",
      isActive: true,
    })
      .populate("participants", "username email")
      .populate("messages.sender", "username");

    if (chat) {
      return res.json({
        success: true,
        chat: chat,
        existed: true,
      });
    }

    // Check if users are contacts
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.contacts.includes(userId)) {
      return res.status(400).json({
        message: "User is not in your contacts. Send an invite first.",
      });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [currentUserId, userId],
      type: "direct",
      messages: [],
      lastMessage: "Chat started!",
    });

    const populatedChat = await Chat.findById(chat._id).populate(
      "participants",
      "username email"
    );

    res.json({
      success: true,
      chat: populatedChat,
      existed: false,
    });
  } catch (error) {
    console.error("Get or create chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getChats,
  getChat,
  sendMessage,
  createDirectChat,
  getOrCreateDirectChat,
};
