const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    }, // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: "30d" } // Expiration time
  );
};

module.exports = generateToken;
