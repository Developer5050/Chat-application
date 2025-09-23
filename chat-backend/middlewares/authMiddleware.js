const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const BlacklistToken = require("../models/blackListToken");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    // 🔴 Check blacklist
    const blacklisted = await BlacklistToken.findOne({ token });
    if (blacklisted)
      return res.status(401).json({ message: "Token is blacklisted. Please login again." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
