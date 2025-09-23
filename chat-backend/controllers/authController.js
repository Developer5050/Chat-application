const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const {
  registerValidation,
  loginValidation,
} = require("../validation/userValidation");
const bcrypt = require("bcryptjs");
const BlacklistToken = require("../models/blackListToken");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ errors: error.details });

  const { username, email, password } = req.body;

  try {
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔑 Password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).json({ errors: error.details });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    const token = generateToken(user);

    if (user && (await user.matchPassword(password))) {
      res.json({
        message: "Login successful",
        user: { id: user._id, username: user.username, email: user.email },
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Decode token to get expiry
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const expiresAt = new Date(decoded.exp * 1000);

    // Save token in blacklist
    await BlacklistToken.create({ token, expiresAt });

    res.status(200).json({ message: "Logout successful (token blacklisted)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getUserProfile = async (req, res) =>{
//      res.json(req.user);
// }
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, logout, getUserProfile };
