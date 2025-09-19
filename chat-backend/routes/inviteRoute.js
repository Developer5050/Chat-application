const express = require("express");
const router = express.Router();

const {
  sendInvite,
  getAllInvitesForUser,
  acceptInvite,
  rejectInvite,
} = require("../controllers/inviteController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/send", protect, sendInvite);
router.get("/:userId", protect, getAllInvitesForUser);
router.post("/accept/:inviteId", protect, acceptInvite);
router.post("/reject/:inviteId", protect, rejectInvite);

module.exports = router;
