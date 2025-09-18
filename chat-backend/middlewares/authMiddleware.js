const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const BlacklistToken = require("../models/blackListToken");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 🔴 Check if token is blacklisted
      const blacklisted = await BlacklistToken.findOne({ token });
      if (blacklisted) {
        return res
          .status(401)
          .json({ message: "Token is blacklisted. Please login again." });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
