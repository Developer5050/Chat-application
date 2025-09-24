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
import {
  FaEllipsisVertical,
  FaPlus,
  FaMicrophone,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa6";
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
import { BsMicMute } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { PiVideoCameraFill } from "react-icons/pi";
import EmojiPicker from "emoji-picker-react";
import whatsappBg from "../../assets/whatsapp1.jpg";
import { getChat, sendMessage } from "../../service/chatApiService";
import socket from "../../socket/Socket";

const ChatArea = ({
  chats,
  setChats,
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

  // Refs
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const plusRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (plusRef.current && !plusRef.current.contains(event.target)) {
        setOpenPlus(false);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Memoized Active Chat Data
  const activeChatData = useMemo(() => {
    if (!activeChat?._id) return null;
    return chats.find((c) => c._id === activeChat._id) || activeChat;
  }, [chats, activeChat]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat details & messages
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

  // Participants List
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

  // Enter press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // ✅ Send message with proper status flow (FIXED)
  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat?._id) return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      text: newMessage,
      sender: userId,
      chatId: activeChat._id,
      status: "sent",
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const response = await sendMessage(activeChat._id, newMessage);
      const serverMessage =
        response.chat.messages[response.chat.messages.length - 1];

      // delivered by default (gray double tick)
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? { ...serverMessage, status: "delivered" }
            : msg
        )
      );

      socket.emit("send-message", {
        chatId: activeChat._id,
        message: { ...serverMessage, status: "delivered" },
      });
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  // ✅ Jab User 2 message receive kare tab 'delivered' mark karein (FIXED)
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      if (activeChat?._id === message.chatId) {
        // ✅ Check karein ki message pehle se nahi hai
        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg._id === message._id);
          if (messageExists) return prev;

          // ✅ New message ko 'delivered' status ke saath add karein
          const deliveredMessage = { ...message, status: "delivered" };
          const updatedMessages = [...prev, deliveredMessage];

          return updatedMessages;
        });

        // ✅ Automatically 'delivered' emit karein (1 second delay ke saath)
        setTimeout(() => {
          socket.emit("message-delivered", {
            chatId: activeChat._id,
            messageId: message._id,
            receiverId: userId,
          });
        }, 1000);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, activeChat, userId, messages]);

  // ✅ Jab User 2 chat open kare aur messages dekhe tab 'seen' mark karein (FIXED)
  const markMessagesAsSeen = useCallback(() => {
    if (!activeChat?._id || !socket) return;

    const unseenMessages = messages.filter(
      (msg) => msg.sender !== userId && msg.status === "delivered"
    );

    if (!unseenMessages.length) return;

    unseenMessages.forEach((msg) => {
      // locally update receiver view (optional)
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, status: "seen" } : m))
      );

      // notify sender that message is seen
      socket.emit("seen-message", {
        chatId: activeChat._id,
        messageId: msg._id,
        seenBy: userId,
      });
    });
  }, [activeChat, messages, userId, socket]);

  // Jab chat open ho ya user scroll/click kare
  useEffect(() => {
    markMessagesAsSeen();

    const container = messagesContainerRef.current;
    if (!container) return;

    const handleInteraction = () => markMessagesAsSeen();

    container.addEventListener("scroll", handleInteraction);
    container.addEventListener("click", handleInteraction);

    return () => {
      container.removeEventListener("scroll", handleInteraction);
      container.removeEventListener("click", handleInteraction);
    };
  }, [markMessagesAsSeen]);

  // 1️⃣ Handle joining and receiving messages
  useEffect(() => {
    if (!userId) return;

    socket.emit("join", userId);

    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === message._id);
        if (exists) return prev;

        return [...prev, { ...message, status: "delivered" }];
      });

      // Emit delivered status after 0.5s
      setTimeout(() => {
        socket.emit("message-delivered", {
          chatId: message.chatId,
          messageId: message._id,
          receiverId: userId,
        });
      }, 500);
    };

    socket.on("receive-message", handleReceiveMessage);

    // Cleanup on unmount
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [userId]);

  // 2️⃣ Handle message status updates
  useEffect(() => {
    if (!socket || !userId) return;

    const handleMessageStatus = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
      );
    };

    socket.on("message-status", handleMessageStatus);

    return () => {
      socket.off("message-status", handleMessageStatus);
    };
  }, [socket, userId]);

  // ✅ Chat updates
  useEffect(() => {
    if (!socket) return;

    const handleChatUpdated = (data) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === data.chatId
            ? {
                ...chat,
                lastMessage: data.lastMessage,
                updatedAt: data.updatedAt,
                unreadCount:
                  activeChat?._id === data.chatId
                    ? 0
                    : (chat.unreadCount || 0) + 1,
              }
            : chat
        )
      );
    };

    socket.on("chat-updated", handleChatUpdated);

    return () => {
      socket.off("chat-updated", handleChatUpdated);
    };
  }, [socket, activeChat, setChats]);

  // ✅ Reset unread count on open
  useEffect(() => {
    if (activeChat?._id) {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === activeChat._id ? { ...chat, unreadCount: 0 } : chat
        )
      );
    }
  }, [activeChat, setChats]);

  // ✅ Render tick status (Correct flow)
  // Status icon renderer
  const renderStatusIcon = (message) => {
    const isSender =
      message.sender?._id === userId || message.sender === userId;
    if (!isSender) return null;

    switch (message.status) {
      case "failed":
        return <FaTimes size={12} className="text-red-500 ml-1" />;
      case "sent":
        return <FaCheck size={14} className="text-gray-500 ml-1" />;
      case "delivered":
        return <FaCheckDouble size={14} className="text-gray-500 ml-1" />;
      case "seen":
        return <FaCheckDouble size={14} className="text-blue-500 ml-1" />;
      default:
        return null;
    }
  };

  // --- Special Views ---
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

        <div className="flex items-center text-gray-600 space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <PiVideoCameraFill size={22} className="text-gray-700" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <MdLocalPhone size={20} className="text-gray-700" />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FaEllipsisVertical size={20} className="text-gray-700" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-4 top-8 w-48 bg-white rounded-lg shadow-lg border z-50">
                <ul className="py-1 text-[15px] text-gray-700">
                  <li className="px-2">
                    <div className="flex items-center px-2 py-2 rounded-md hover:bg-gray-200 cursor-pointer">
                      <IoMdInformationCircleOutline
                        className="mr-2 text-gray-600 mt-0.5"
                        size={18}
                      />
                      Contact Info
                    </div>
                  </li>
                  <li className="px-2">
                    <div className="flex items-center px-2 py-2 rounded-md hover:bg-gray-200 cursor-pointer">
                      <BsMicMute
                        className="mr-2 text-gray-600 mt-0.5"
                        size={18}
                      />
                      Mute Notifications
                    </div>
                  </li>
                  <li className="px-2">
                    <div className="flex items-center px-2 py-2 rounded-md hover:bg-gray-200 cursor-pointer">
                      <MdFavoriteBorder
                        className="mr-2 text-gray-600 mt-0.5"
                        size={18}
                      />
                      Add to favourites
                    </div>
                  </li>
                  <li className="px-2 mb-1">
                    <div className="flex items-center px-2 py-2 rounded-md hover:bg-gray-200 cursor-pointer">
                      <IoCloseCircleOutline
                        className="mr-2 text-gray-600 mt-0.5"
                        size={18}
                      />
                      Close chat
                    </div>
                  </li>
                  <hr className="h-0.5 bg-gray-200 w-44 mx-auto" />
                  <li className="px-2 mt-1">
                    <div className="flex items-center px-2 py-2 rounded-md hover:bg-red-200 cursor-pointer">
                      <LuThumbsDown
                        className="mr-2 text-gray-600 mt-0.5"
                        size={18}
                      />
                      Report
                    </div>
                  </li>
                  <li className="px-2">
                    <div className="flex items-center px-2 py-2 rounded-md hover:bg-red-200 cursor-pointer">
                      <MdBlockFlipped
                        className="mr-2 text-gray-600 mt-0.5"
                        size={18}
                      />
                      Block
                    </div>
                  </li>
                  <li className="px-2">
                    <div className="flex items-center px-2 py-2 rounded-md hover:bg-red-200 cursor-pointer">
                      <IoIosRemoveCircleOutline
                        className="mr-2 text-gray-600 mt-0.5"
                        size={18}
                      />
                      Clear chat
                    </div>
                  </li>
                  <li className="px-2">
                    <div className="flex items-center px-2 py-2 rounded-md hover:bg-red-200 cursor-pointer">
                      <RiDeleteBin6Line
                        className="mr-2 text-gray-600 mt-0.5"
                        size={18}
                      />
                      Delete chat
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-cover bg-center"
        style={{ backgroundImage: `url(${whatsappBg})` }}
      >
        <div className="space-y-3">
          {messages.map((message) => {
            const isSender =
              message.sender?._id === userId || message.sender === userId;

            return (
              <div
                key={message._id || message.createdAt}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isSender
                      ? "bg-green-100 text-gray-800 border border-green-200"
                      : "bg-white text-gray-800 border border-gray-200"
                  } ${message.status === "failed" ? "opacity-70" : ""}`}
                >
                  <p className="text-sm">{message.text}</p>

                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {renderStatusIcon(message)}
                  </div>
                </div>
              </div>
            );
          })}
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
        <div
          className="flex-1 flex items-center rounded-full px-3 py-2 shadow-sm border border-gray-300 bg-white relative"
          ref={plusRef}
        >
          <button
            type="button"
            onClick={() => setOpenPlus((prev) => !prev)}
            className="text-gray-600 hover:text-gray-800 mr-3"
          >
            {openPlus ? <FaTimes size={18} /> : <FaPlus size={18} />}
          </button>

          {openPlus && (
            <div className="absolute bottom-12 left-0 w-48 bg-white rounded-lg shadow-lg border z-50">
              <ul className="py-1 text-[15px] text-gray-700">
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <IoDocumentText className="mr-2 text-purple-600" size={18} />{" "}
                  Document
                </li>
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <IoMdPhotos className="mr-2 text-blue-600" size={18} /> Photos
                  & Videos
                </li>
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <IoPerson className="mr-2 text-cyan-600" size={18} /> Contact
                </li>
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <FaPoll className="mr-2 text-yellow-600" size={18} /> Poll
                </li>
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <MdEvent className="mr-2 text-pink-600" size={18} /> Event
                </li>
              </ul>
            </div>
          )}

          <button
            className="text-gray-600 hover:text-gray-800 mr-3"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <FaRegSmile size={18} />
          </button>

          <input
            type="text"
            className="flex-1 focus:outline-none bg-transparent text-gray-800"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

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
