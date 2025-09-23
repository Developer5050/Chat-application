const mongoose = require("mongoose");
const Invite = require("../models/inviteModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendInvite = async (req, res) => {
  try {
    const { email, chatId } = req.body; // chatId for group invites, email for one-on-one
    const senderId = req.user.id;

    if (!email && !chatId) {
      return res.status(400).json({ message: "Email or chat ID is required" });
    }

    let receiver, inviteType, chat;

    if (email) {
      // One-on-one invite
      if (!email) return res.status(400).json({ message: "Email is required" });

      // Find user by email
      receiver = await User.findOne({ email: email.toLowerCase() });
      if (!receiver) return res.status(404).json({ message: "User not found" });

      // Prevent sending invite to yourself
      if (receiver._id.toString() === senderId) {
        return res
          .status(400)
          .json({ message: "Cannot send invite to yourself" });
      }

      // Check if users are already contacts
      const senderUser = await User.findById(senderId);
      if (senderUser.contacts.includes(receiver._id)) {
        return res
          .status(400)
          .json({ message: "User is already in your contacts" });
      }

      // Prevent sending duplicate pending invites
      const existingInvite = await Invite.findOne({
        sender: senderId,
        receiver: receiver._id,
        status: "pending",
        inviteType: "one-on-one",
      });

      if (existingInvite) {
        return res.status(400).json({ message: "Invite already sent" });
      }

      inviteType = "one-on-one";
    } else {
      // Group invite
      if (!chatId)
        return res.status(400).json({ message: "Chat ID is required" });

      chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ message: "Chat not found" });

      // Verify sender is admin of the group
      if (chat.admin.toString() !== senderId) {
        return res
          .status(403)
          .json({ message: "Only group admin can send invites" });
      }

      // For group invites, we need to specify the receiver by email
      if (!email)
        return res
          .status(400)
          .json({ message: "Email is required for group invite" });

      receiver = await User.findOne({ email: email.toLowerCase() });
      if (!receiver) return res.status(404).json({ message: "User not found" });

      // Check if user is already in the group
      if (chat.participants.includes(receiver._id)) {
        return res
          .status(400)
          .json({ message: "User is already in the group" });
      }

      inviteType = "group";
    }

    const invite = await Invite.create({
      sender: senderId,
      receiver: receiver._id,
      inviteType: inviteType,
      chat: chatId || null, // chatId for group invites, null for one-on-one
      status: "pending",
    });

    res.status(201).json({
      message: "Invite sent successfully",
      invite: {
        _id: invite._id,
        sender: invite.sender,
        receiver: invite.receiver,
        inviteType: invite.inviteType,
        chat: invite.chat,
        status: invite.status,
        createdAt: invite.createdAt,
      },
    });
  } catch (error) {
    console.error("Send invite error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllInvitesForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Get invites where user is receiver (pending invites)
    const receivedInvites = await Invite.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "username email")
      .populate("receiver", "username email")
      .populate("chat", "name type participants")
      .sort({ createdAt: -1 });

    // Get invites where user is sender (sent invites)
    const sentInvites = await Invite.find({
      sender: userId,
      status: "pending",
    })
      .populate("sender", "username email")
      .populate("receiver", "username email")
      .populate("chat", "name type participants")
      .sort({ createdAt: -1 });

    res.json({
      receivedInvites,
      sentInvites,
    });
  } catch (error) {
    console.error("Get invites error:", error);
    res.status(500).json({ message: error.message });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({ message: "Invalid invite ID" });
    }

    const invite = await Invite.findById(inviteId)
      .populate("sender", "username")
      .populate("receiver", "username")
      .populate("chat", "name type participants");

    if (!invite) return res.status(404).json({ message: "Invite not found" });

    // Only receiver can accept
    if (invite.receiver._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this invite" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Invite has already been processed" });
    }

    let chat;

    if (invite.inviteType === "one-on-one") {
      // Create direct chat
      chat = await Chat.create({
        participants: [invite.sender._id, invite.receiver._id],
        type: "direct",
        messages: [],
        lastMessage: `Chat started between ${invite.sender.username} and ${invite.receiver.username}`,
      });

      // Add users to each other's contacts
      await User.findByIdAndUpdate(invite.sender._id, {
        $addToSet: { contacts: invite.receiver._id },
      });

      await User.findByIdAndUpdate(invite.receiver._id, {
        $addToSet: { contacts: invite.sender._id },
      });
    } else if (invite.inviteType === "group") {
      // Add user to existing group chat
      if (!invite.chat) {
        return res.status(400).json({ message: "Group chat not found" });
      }

      chat = await Chat.findByIdAndUpdate(
        invite.chat._id,
        {
          $addToSet: { participants: invite.receiver._id },
        },
        { new: true }
      ).populate("participants", "username email");
    }

    // Update invite status and link to chat
    invite.status = "accepted";
    if (invite.inviteType === "one-on-one") {
      invite.chat = chat._id;
    }
    await invite.save();

    // Populate the chat for response
    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "username email")
      .populate("admin", "username");

    res.status(200).json({
      message: `Invite accepted successfully`,
      chat: populatedChat,
      inviteType: invite.inviteType,
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    res.status(500).json({ message: error.message });
  }
};

const rejectInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({ message: "Invalid invite ID" });
    }

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    // Only receiver can reject
    if (invite.receiver.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this invite" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Invite has already been processed" });
    }

    // Update status to rejected (keep record)
    invite.status = "rejected";
    await invite.save();

    res.status(200).json({ message: "Invite rejected" });
  } catch (error) {
    console.error("Reject invite error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get specific invite details
const getInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({ message: "Invalid invite ID" });
    }

    const invite = await Invite.findById(inviteId)
      .populate("sender", "username email")
      .populate("receiver", "username email")
      .populate("chat", "name type participants");

    if (!invite) return res.status(404).json({ message: "Invite not found" });

    // Check if user is involved in this invite
    if (
      invite.sender._id.toString() !== req.user.id &&
      invite.receiver._id.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this invite" });
    }

    res.json(invite);
  } catch (error) {
    console.error("Get invite error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel a sent invite
const cancelInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({ message: "Invalid invite ID" });
    }

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    // Only sender can cancel
    if (invite.sender.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this invite" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot cancel a processed invite" });
    }

    await Invite.findByIdAndDelete(inviteId);

    res.status(200).json({ message: "Invite cancelled successfully" });
  } catch (error) {
    console.error("Cancel invite error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendInvite,
  getAllInvitesForUser,
  acceptInvite,
  rejectInvite,
  getInvite,
  cancelInvite,
};
