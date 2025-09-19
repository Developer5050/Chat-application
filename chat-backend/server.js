require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5000;
const connectDb = require("./dbConfig/DbConfig");

// Connect to Db
connectDb();

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend port
    methods: ["GET", "POST"],
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) {
      console.warn("⚠️ Null userId received, ignoring...");
      return;
    }
    users[userId] = socket.id;
    console.log("Online users:", users);
  });

  socket.on("call-user", ({ userToCall, signalData, from }) => {
    const socketId = users[userToCall];
    if (socketId) {
      io.to(socketId).emit("call-made", { signal: signalData, from });
    }
  });

  socket.on("answer-call", ({ to, signal }) => {
    const socketId = users[to];
    if (socketId) {
      io.to(socketId).emit("call-accepted", signal);
    }
  });

  socket.on("disconnect", () => {
    for (let id in users) {
      if (users[id] === socket.id) {
        delete users[id];
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// Import Routes
const authRoute = require("./routes/authRoute");
const inviteRoute = require("./routes/inviteRoute");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/invite", inviteRoute);

// ✅ Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`✅ Server is running at ${PORT}`);
});
