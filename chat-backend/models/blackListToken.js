const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Expired tokens ko auto delete karo (TTL index)
blacklistTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistToken = mongoose.model("BlacklistToken", blacklistTokenSchema);
module.exports = BlacklistToken;
