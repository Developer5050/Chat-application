import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  MdLocalPhone,
  MdFavoriteBorder,
  MdBlockFlipped,
  MdEvent,
} from "react-icons/md";
import { FcInvite } from "react-icons/fc";
import { FaEllipsisVertical, FaPlus, FaMicrophone } from "react-icons/fa6";
import { FaPoll, FaTimes, FaRegSmile } from "react-icons/fa";
import {
  IoSend,
  IoCloseCircleOutline,
  IoDocumentText,
  IoPerson,
} from "react-icons/io5";
import {
  IoMdInformationCircleOutline,
  IoIosRemoveCircleOutline,
  IoMdPhotos,
} from "react-icons/io";
import { LuThumbsDown } from "react-icons/lu";
import { BiMessageSquareCheck } from "react-icons/bi";
import { BsMicMute } from "react-icons/bs";
import { SlSpeedometer } from "react-icons/sl";
import { RiDeleteBin6Line } from "react-icons/ri";
import { PiVideoCameraFill } from "react-icons/pi";
import EmojiPicker from "emoji-picker-react";
import whatsappBg from "../../assets/whatsapp1.jpg";
import io from "socket.io-client";
import Peer from "simple-peer";
import { getChat, sendMessage } from "../../service/chatApiService";

const socket = io("http://localhost:5000");

const ChatArea = ({
  chats,
  activeChat,
  messages,
  setMessages,
  newMessage,
  setNewMessage,
  activeView,
  userId,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openPlus, setOpenPlus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);

  // Video/Audio Call States
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef();
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Memoized Active Chat Data
  const activeChatData = useMemo(() => {
    if (!activeChat?._id) return null;
    return chats.find((c) => c._id === activeChat._id) || activeChat;
  }, [chats, activeChat]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat details and messages when active chat changes
  useEffect(() => {
    const loadChatDetails = async () => {
      if (!activeChat?._id) return;

      try {
        setLoading(true);
        const response = await getChat(activeChat._id);
        setCurrentChat(response.chat);
        setMessages(response.chat.messages || []);
      } catch (error) {
        console.error("Error loading chat details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChatDetails();
  }, [activeChat, setMessages]);

  // Receiver (other participants)
  const receiverIds = useMemo(() => {
    if (!activeChatData?.participants) return [];
    return activeChatData.participants
      .filter((p) => p._id !== userId)
      .map((p) => p._id);
  }, [activeChatData, userId]);

  // Chat display name
  const chatDisplayName = useMemo(() => {
    if (!activeChatData) return "Loading...";

    if (activeChatData.type === "direct") {
      const otherUser = activeChatData.participants?.find(
        (p) => p._id !== userId
      );
      return otherUser?.username || "Unknown User";
    } else if (activeChatData.type === "group") {
      return activeChatData.name || "Group Chat";
    }
    return "Unknown Chat";
  }, [activeChatData, userId]);

  // Chat participants list (for group chats)
  const participantsList = useMemo(() => {
    if (!activeChatData?.participants) return "";

    if (activeChatData.type === "direct") {
      const otherUser = activeChatData.participants.find(
        (p) => p._id !== userId
      );
      return otherUser?.username || "";
    } else {
      return activeChatData.participants
        .map((p) => p.username)
        .filter((name) => name)
        .join(", ");
    }
  }, [activeChatData, userId]);

  // Emoji Picker
  const onEmojiClick = useCallback(
    (emojiObject) => {
      setNewMessage((prev) => prev + emojiObject.emoji);
    },
    [setNewMessage]
  );

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Send Message
  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat?._id) return;

    try {
      const response = await sendMessage(activeChat._id, newMessage);
      const newMsg = response.chat.messages[response.chat.messages.length - 1];

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  // Media & Socket Setup (for calls - optional)
  useEffect(() => {
    // Initialize media devices for calls
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      })
      .catch((error) => {
        console.warn("Media devices not available:", error);
      });

    // Socket setup for real-time features
    if (userId) {
      socket.emit("join", userId);

      socket.on("call-made", ({ from, signal }) =>
        setCall({ isReceivingCall: true, from, signal })
      );

      socket.on("call-accepted", (signal) => {
        setCallAccepted(true);
        connectionRef.current?.signal(signal);
      });

      // Listen for new messages
      socket.on("new-message", (message) => {
        if (message.chat === activeChat?._id) {
          setMessages((prev) => [...prev, message]);
        }
      });

      return () => {
        socket.off("call-made");
        socket.off("call-accepted");
        socket.off("new-message");
      };
    }
  }, [userId, activeChat]);

  // Call Functions (optional feature)
  const callUser = useCallback(
    (id) => {
      if (!id || !stream) return;
      const peer = new Peer({ initiator: true, trickle: false, stream });

      peer.on("signal", (data) =>
        socket.emit("call-user", {
          userToCall: id,
          signalData: data,
          from: userId,
        })
      );

      peer.on("stream", (currentStream) => {
        if (userVideo.current) userVideo.current.srcObject = currentStream;
      });

      connectionRef.current = peer;
    },
    [stream, userId]
  );

  const answerCall = useCallback(() => {
    if (!call.from || !stream) return;

    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) =>
      socket.emit("answer-call", { to: call.from, signal: data })
    );

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  }, [call, stream]);

  // --- Render special views ---
  if (activeView === "invite") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <FcInvite className="text-5xl text-gray-500 mb-2" />
        <h2 className="text-2xl font-medium text-gray-700">Invite Friends</h2>
        <p className="text-gray-500 mt-2">Send invites to start chatting</p>
      </div>
    );
  }

  if (activeView === "profile") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <IoPerson className="text-5xl text-gray-500 mb-3" />
        <h2 className="text-2xl font-medium text-gray-700">Profile</h2>
        <p className="text-gray-500 mt-2">Manage your account settings</p>
      </div>
    );
  }

  if (!activeChatData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-700">
            Welcome to ChatApp
          </h2>
          <p className="text-gray-500 mt-2">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  // --- Main Chat Area ---
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center h-16 border-b">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg mr-3">
            {chatDisplayName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-2">
            <h3 className="font-semibold text-gray-800">{chatDisplayName}</h3>
            <p className="text-xs text-gray-600">
              {activeChatData.type === "group"
                ? `${activeChatData.participants?.length || 0} participants`
                : participantsList}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-gray-600 text-xl">
          {/* Call buttons - only for direct chats */}
          {activeChatData.type === "direct" && receiverIds.length > 0 && (
            <>
              <button
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full"
                onClick={() => callUser(receiverIds[0])}
                title="Video Call"
              >
                <PiVideoCameraFill />
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full"
                onClick={() => callUser(receiverIds[0])}
                title="Voice Call"
              >
                <MdLocalPhone />
              </button>
            </>
          )}

          {/* Dropdown */}
          <div className="relative">
            <button
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <FaEllipsisVertical />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-60 bg-white rounded-xl shadow-2xl py-1 z-10">
                {[
                  { icon: IoMdInformationCircleOutline, label: "Chat Info" },
                  { icon: BiMessageSquareCheck, label: "Select messages" },
                  { icon: BsMicMute, label: "Mute notifications" },
                  { icon: MdFavoriteBorder, label: "Add to favourites" },
                  { icon: IoCloseCircleOutline, label: "Close chat" },
                  ...(activeChatData.type === "group"
                    ? [{ icon: IoPerson, label: "Add participants" }]
                    : []),
                  { icon: LuThumbsDown, label: "Report", red: true },
                  { icon: MdBlockFlipped, label: "Block", red: true },
                  {
                    icon: IoIosRemoveCircleOutline,
                    label: "Clear chat",
                    red: true,
                  },
                  { icon: RiDeleteBin6Line, label: "Delete Chat", red: true },
                ].map((item, idx) => (
                  <div key={idx} className="px-2">
                    <button
                      className={`flex items-center px-4 py-2 text-sm w-full rounded-md ${
                        item.red
                          ? "text-red-700 hover:bg-red-100"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <item.icon className="text-lg mr-3" />
                      <span>{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 p-4 overflow-y-auto bg-cover bg-center"
        style={{ backgroundImage: `url(${whatsappBg})` }}
      >
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message._id || message.createdAt}
              className={`flex ${
                message.sender?._id === userId || message.sender === userId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender?._id === userId || message.sender === userId
                    ? "bg-green-100 text-gray-800 border border-green-200"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs text-gray-500 text-right mt-1">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 flex items-center bg-white relative">
        <div className="flex-1 flex items-center rounded-full px-3 py-2 shadow-sm border border-gray-300 bg-white relative">
          {/* Plus button for attachments */}
          <button
            type="button"
            onClick={() => setOpenPlus((prev) => !prev)}
            className="text-gray-600 hover:text-gray-800 mr-3"
          >
            {openPlus ? <FaTimes size={18} /> : <FaPlus size={18} />}
          </button>

          {openPlus && (
            <div className="absolute bottom-14 left-0 bg-white border rounded-xl shadow-md w-48 p-1 z-10">
              {[
                {
                  icon: IoDocumentText,
                  label: "Document",
                  color: "text-purple-500",
                },
                {
                  icon: IoMdPhotos,
                  label: "Photos & videos",
                  color: "text-blue-500",
                },
                { icon: IoPerson, label: "Contact", color: "text-cyan-500" },
                { icon: FaPoll, label: "Poll", color: "text-yellow-500" },
                { icon: MdEvent, label: "Event", color: "text-pink-500" },
              ].map((item, idx) => (
                <div key={idx} className="px-2">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md">
                    <item.icon className={`text-lg ${item.color} mr-3`} />
                    <span>{item.label}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Emoji button */}
          <button
            className="text-gray-600 hover:text-gray-800 mr-3"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <FaRegSmile size={18} />
          </button>

          {/* Message input */}
          <input
            type="text"
            className="flex-1 focus:outline-none bg-transparent text-gray-800"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          {/* Send/Mic button */}
          {newMessage.trim() === "" ? (
            <button className="text-gray-600 hover:text-gray-800 ml-3 p-2 rounded-full">
              <FaMicrophone size={18} />
            </button>
          ) : (
            <button
              className="text-white bg-green-600 hover:bg-green-700 p-2 rounded-full ml-2"
              onClick={handleSend}
              disabled={loading}
            >
              <IoSend size={18} />
            </button>
          )}
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-14 left-3 z-50 shadow-lg"
          >
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
