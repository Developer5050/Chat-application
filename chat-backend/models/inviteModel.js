const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For group invites, reference the chat being invited to
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    // Type to distinguish between 1-on-1 and group invites
    inviteType: {
      type: String,
      enum: ["one-on-one", "group"],
      default: "one-on-one",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Index for one-on-one invites (prevent duplicates)
inviteSchema.index(
  {
    sender: 1,
    receiver: 1,
    inviteType: 1,
  },
  {
    unique: true,
    partialFilterExpression: { inviteType: "one-on-one" },
  }
);

module.exports = mongoose.model("Invite", inviteSchema);
