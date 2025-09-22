const mongoose = require("mongoose");
const Invite = require("../models/inviteModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendInvite = async (req, res) => {
  try {
    const { email } = req.body; // frontend se email aayega
    const senderId = req.user.id;

    if (!email) return res.status(400).json({ message: "Email is required" });

    // Find user by email
    const receiver = await User.findOne({ email });
    if (!receiver) return res.status(404).json({ message: "User not found" });

    // Prevent sending duplicate pending invites
    const existing = await Invite.findOne({
      sender: senderId,
      receiver: receiver._id,
      status: "pending",
    });
    if (existing)
      return res.status(400).json({ message: "Invite already sent" });

    const invite = await Invite.create({
      sender: senderId,
      receiver: receiver._id,
    });

    // Update sender & receiver invites array
    await User.findByIdAndUpdate(senderId, { $push: { invites: invite._id } });
    await User.findByIdAndUpdate(receiver._id, {
      $push: { invites: invite._id },
    });

    res.status(201).json(invite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllInvitesForUser = async (req, res) => {
  try {
    const userId = req.user.id; // authenticated user

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const invites = await Invite.find({
      $or: [{ sender: userObjectId }, { receiver: userObjectId }],
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
    const chat = await Chat.create({
      participants: [invite.sender, invite.receiver],
      messages: [],
    });

    // 6. Add each other to contacts
    await User.findByIdAndUpdate(invite.sender, {
      $addToSet: { contacts: invite.receiver },
    });
    await User.findByIdAndUpdate(invite.receiver, {
      $addToSet: { contacts: invite.sender },
    });

    // 5. Delete invite after acceptance
    await Invite.findByIdAndDelete(inviteId);

    // Populate sender and receiver objects
    const sender = await User.findById(invite.sender).select("_id name");
    const receiver = await User.findById(invite.receiver).select("_id name");

    // 7. Return proper data for frontend
    res.status(200).json({
      message: "Invite accepted and chat created",
      chatId: chat._id,
      sender,
      receiver,
    });
  } catch (error) {
    console.error(error);
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
      return res.status(403).json({ message: "Not authorized" });
    }

    // invite.status = "rejected";
    // await invite.save();

    // Remove invite completely from DB
    await Invite.findByIdAndDelete(inviteId);

    res.status(200).json({ message: "Invite rejected and removed" });
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
