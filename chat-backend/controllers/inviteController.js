const mongoose = require("mongoose");
const Invite = require("../models/inviteModel");
// const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// 1️⃣ Send Invite
const sendInvite = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id; // from auth middleware

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID" });
    }

    // Prevent sending duplicate pending invites
    const existing = await Invite.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });
    if (existing) return res.status(400).json({ message: "Invite already sent" });

    const invite = await Invite.create({
      sender: senderId,
      receiver: receiverId,
    });

    res.status(201).json(invite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 2️⃣ Get All Invites for User (both sent and received)
const getAllInvitesForUser = async (req, res) => {
  try {
    const userId = req.user.id; // authenticated user

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const invites = await Invite.find({
      $or: [
        { sender: userObjectId },
        { receiver: userObjectId },
      ],
    })
      .populate("sender", "username email")
      .populate("receiver", "username email")
      .sort({ createdAt: -1 });

    res.json(invites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 3️⃣ Accept Invite
const acceptInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    // 1. Validate invite ID
    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({ message: "Invalid invite ID" });
    }

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    // 2. Only receiver can accept
    if (invite.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 3. Update invite status
    invite.status = "accepted";
    await invite.save();

    // 4. Create chat between sender and receiver
    await Chat.create({
      participants: [invite.sender, invite.receiver],
      messages: [],
    });

    // 5. Delete invite if you want to remove it after acceptance
    await Invite.findByIdAndDelete(inviteId);

    res.status(200).json({ message: "Invite accepted and chat created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 4️⃣ Reject Invite
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
      return res.status(403).json({ message: "Not authorized" });
    }

    invite.status = "rejected";
    await invite.save();

    res.json(invite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendInvite,
  getAllInvitesForUser,
  acceptInvite,
  rejectInvite,
};
