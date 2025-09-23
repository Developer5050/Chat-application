require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDb = require("./dbConfig/DbConfig");
const Chat = require("./models/chatModel"); // Chat model import
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to Db
connectDb();

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend port
    credentials: true, // ✅ allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const users = {}; // store online users

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // ---- Video/Audio Call Events ----
  socket.on("join", (userId) => {
    if (!userId) {
      console.warn("⚠️ Null userId received, ignoring...");
      return;
    }
    users[userId] = socket.id;
    console.log("👥 Online users:", users);
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

  // ---- Chat Events ----
  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`💬 User ${socket.id} joined chat room: ${chatId}`);
  });

  socket.on("send-message", async ({ chatId, message }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        console.warn(`⚠️ Chat ${chatId} not found`);
        return;
      }

      chat.messages.push(message);
      chat.lastMessage = message.text; // keep last message updated
      await chat.save();

      // Broadcast to all users in the chat room
      io.to(chatId).emit("receive-message", message);
    } catch (err) {
      console.error("❌ Message save error:", err);
    }
  });

  // ---- Disconnect ----
  socket.on("disconnect", () => {
    for (let id in users) {
      if (users[id] === socket.id) {
        delete users[id];
        break;
      }
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Import Routes
const authRoute = require("./routes/authRoute");
const inviteRoute = require("./routes/inviteRoute");
const chatRoute = require("./routes/chatRoute");

// ✅ Middleware (CORS fix applied)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoute);
app.use("/api/invites", inviteRoute);
app.use("/api/chats", chatRoute);

// ✅ Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server is running at port ${PORT}`);
});
