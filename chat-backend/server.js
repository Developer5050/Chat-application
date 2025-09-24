require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDb = require("./dbConfig/DbConfig");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
connectDb();

// ✅ HTTP Server
const server = http.createServer(app);

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
  transports: ["websocket"], // only websocket
  pingInterval: 25000,
  pingTimeout: 60000,
  allowUpgrades: true,
  maxHttpBufferSize: 1e8,
});

const users = {}; // online users

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // ---- Join user
  socket.on("join", (userId) => {
    if (!userId) return;
    users[userId] = socket.id;
    console.log("👥 Online users:", users);
  });

  // ---- Call events
  socket.on("call-user", ({ userToCall, signalData, from }) => {
    const socketId = users[userToCall];
    if (socketId)
      io.to(socketId).emit("call-made", { signal: signalData, from });
  });

  socket.on("answer-call", ({ to, signal }) => {
    const socketId = users[to];
    if (socketId) io.to(socketId).emit("call-accepted", signal);
  });

  // ---- Chat events
  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`💬 ${socket.id} joined chat: ${chatId}`);
  });

  // ---- Send message
  socket.on("send-message", ({ chatId, message }) => {
    // ✅ Initially sender sees gray double tick (delivered)
    message.status = "delivered";
    socket.emit("message-status", {
      messageId: message._id,
      status: "delivered",
    });

    // ✅ Deliver to other users
    socket
      .to(chatId)
      .emit("receive-message", { ...message, status: "delivered" });

    // ✅ Update chat list for all
    io.emit("chat-updated", {
      chatId,
      lastMessage: message.text,
      updatedAt: new Date(),
    });
  });

  // ---- Seen message event
  socket.on("seen-message", ({ chatId, messageId, seenBy }) => {
    // Emit to sender(s) that message is seen
    io.to(chatId).emit("message-status", { messageId, status: "seen" });
  });

  // ---- Disconnect
  socket.on("disconnect", (reason) => {
    for (let id in users) {
      if (users[id] === socket.id) delete users[id];
    }
    console.log("❌ User disconnected:", socket.id, "Reason:", reason);
  });
});

// ✅ Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/invites", require("./routes/inviteRoute"));
app.use("/api/chats", require("./routes/chatRoute"));

// ✅ Start server
server.listen(PORT, () => console.log(`🚀 Server running at port ${PORT}`));
