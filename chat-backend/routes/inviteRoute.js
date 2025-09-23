const express = require("express");
const router = express.Router();

const {
  sendInvite,
  getAllInvitesForUser,
  acceptInvite,
  rejectInvite,
  getInvite,
  cancelInvite,
} = require("../controllers/inviteController");
const { protect } = require("../middlewares/authMiddleware");

// Send invite (one-on-one)
router.post("/send", protect, sendInvite);

// Get all invites for current user
router.get("/", protect, getAllInvitesForUser);

// Get specific invite details
router.get("/:inviteId", protect, getInvite);

// Accept invite
router.post("/accept/:inviteId", protect, acceptInvite);

// Reject invite
router.post("/reject/:inviteId", protect, rejectInvite);

// Cancel sent invite
router.delete("/cancel/:inviteId", protect, cancelInvite);

module.exports = router;
