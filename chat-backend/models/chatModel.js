const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    status: { 
    type: String, 
    enum: ['sent', 'delivered', 'seen', 'failed'],
    default: 'sent'
  },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      type: String,
      default: "",
    },
    // Chat name (for group chats)
    name: {
      type: String,
      maxlength: 50,
    },
    // Chat description (for group chats)
    description: {
      type: String,
      maxlength: 200,
    },
    // Chat type: 'direct' (1-on-1) or 'group'
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    // Group admin (for group chats)
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for direct chats (ensure only one active direct chat between same users)
chatSchema.index(
  {
    participants: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "direct",
      isActive: true,
    },
  }
);

module.exports = mongoose.model("Chat", chatSchema);
