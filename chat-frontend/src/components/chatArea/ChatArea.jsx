import React, { useState, useRef, useEffect } from "react";
import {
  MdLocalPhone,
  MdFavoriteBorder,
  MdBlockFlipped,
  MdEvent,
} from "react-icons/md";
import { FcInvite } from "react-icons/fc";
import { FaEllipsisVertical, FaPlus, FaMicrophone } from "react-icons/fa6";
import { FaPoll, FaRegSmile, FaTimes } from "react-icons/fa";
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

const socket = io("http://localhost:5000");

const ChatArea = ({
  chats,
  activeChat,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyPress,
  activeView,
  userId,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openPlus, setOpenPlus] = useState(false);

  // --- Video/Audio Call States ---
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef();

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

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

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      });

    if (!userId) {
      console.error("⚠️ userId missing, call feature won't work");
      return;
    }

    socket.emit("join", userId);

    socket.on("call-made", ({ from, signal }) => {
      setCall({ isReceivingCall: true, from, signal });
    });

    socket.on("call-accepted", (signal) => {
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
    });

    return () => {
      socket.off("call-made");
      socket.off("call-accepted");
    };
  }, [userId]);

  // Caller function
  const callUser = (id) => {
     console.log("📞 Calling user:", id);
    if (!id) return;
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("call-user", {
        userToCall: id,
        signalData: data,
        from: userId,
      });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    connectionRef.current = peer;
  };

  // Receiver function
  const answerCall = () => {
    if (!call.from) return;

    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answer-call", {
        to: call.from,
        signal: data,
      });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  // Safe receiverId
  const receiverId = chats.find((c) => c.id === activeChat)?.userId || null;

  // --- Render special views ---
  if (activeView === "invite") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <FcInvite className="text-5xl text-gray-500 mb-2 mr-2" />
        <h2 className="text-2xl font-medium text-gray-700">Invite</h2>
      </div>
    );
  }

  if (activeView === "profile") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <IoPerson className="text-5xl text-gray-500 mb-3 mr-2" />
        <h2 className="text-2xl font-medium text-gray-700">Profile</h2>
      </div>
    );
  }

  // --- Main Chat Area ---
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center h-16 border-b">
        <div className="flex items-center">
          <img
            className="h-12 w-12 rounded-full"
            src={`https://ui-avatars.com/api/?name=${
              chats.find((chat) => chat.id === activeChat)?.name
            }&background=random`}
            alt={chats.find((chat) => chat.id === activeChat)?.name}
          />
          <div className="ml-2">
            <h3 className="font-semibold">
              {chats.find((chat) => chat.id === activeChat)?.name}
            </h3>
            <p className="text-xs text-gray-600">
              {chats.find((chat) => chat.id === activeChat)?.online
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-black text-xl">
          {/* Video Call Button */}
          <button
            className="w-10 h-10 flex items-center justify-center"
            onClick={() => receiverId && callUser(receiverId)}
          >
            <PiVideoCameraFill />
          </button>

          {/* Audio Call Button */}
          <button
            className="w-10 h-10 flex items-center justify-center"
            onClick={() => receiverId && callUser(receiverId)}
          >
            <MdLocalPhone />
          </button>

          {/* Dropdown Button */}
          <div className="relative">
            <button
              className="w-10 h-10 flex items-center justify-center"
              onClick={toggleOpen}
            >
              <FaEllipsisVertical />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-2xl py-1 z-10">
                <div className="px-2">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full rounded-md">
                    <IoMdInformationCircleOutline className="text-lg" />
                    <span className="ml-3">Contact Info</span>
                  </button>
                </div>

                <div className="px-2">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full rounded-md">
                    <BiMessageSquareCheck className="text-lg" />
                    <span className="ml-3">Select messages</span>
                  </button>
                </div>

                <div className="px-2">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full rounded-md">
                    <BsMicMute className="text-lg" />
                    <span className="ml-3">Mute notifications</span>
                  </button>
                </div>

                <div className="px-2">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full rounded-md">
                    <SlSpeedometer className="text-md" />
                    <span className="ml-3">Disappearing messages</span>
                  </button>
                </div>

                <div className="px-2">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full rounded-md">
                    <MdFavoriteBorder className="text-lg" />
                    <span className="ml-3">Add to favourites</span>
                  </button>
                </div>

                <div className="px-2">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full rounded-md">
                    <IoCloseCircleOutline className="text-lg" />
                    <span className="ml-3">Close chat</span>
                  </button>
                </div>

                <hr className="h-2 w-48 ml-4 text-gray-300 mt-3" />

                <div className="px-2">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-700 w-full rounded-md">
                    <LuThumbsDown className="text-lg" />
                    <span className="ml-3">Report</span>
                  </button>
                </div>

                <div className="px-2">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-700 w-full rounded-md">
                    <MdBlockFlipped className="text-lg" />
                    <span className="ml-3">Block</span>
                  </button>
                </div>

                <div className="px-2">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-700 w-full rounded-md">
                    <IoIosRemoveCircleOutline className="text-lg" />
                    <span className="ml-3">Clear chat</span>
                  </button>
                </div>

                <div className="px-2">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-700 rounded-md">
                    <RiDeleteBin6Line className="text-lg" />
                    <span className="ml-3">Delete Chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Elements */}
      <div className="flex gap-4 p-2">
        {stream && (
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{ width: "200px", borderRadius: "10px" }}
          />
        )}

        {callAccepted && (
          <video
            playsInline
            ref={userVideo}
            autoPlay
            style={{ width: "200px", borderRadius: "10px" }}
          />
        )}

        {/* Incoming Call UI */}
        {call.isReceivingCall && !callAccepted && (
          <div className="flex flex-col items-start bg-white shadow-md rounded-lg p-3">
            <p className="text-sm font-medium mb-2 text-gray-700">
              {call.from} is calling...
            </p>
            <div className="flex gap-2">
              <button
                onClick={answerCall}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => setCall({})}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 p-4 overflow-y-auto bg-cover bg-center"
        style={{ backgroundImage: `url(${whatsappBg})` }}
      >
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-1 rounded-lg ${
                  message.sender === "me"
                    ? "bg-green-400 text-black"
                    : "bg-gray-300"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs text-gray-500 text-right mt-0.5">
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 flex items-center bg-white relative">
        <div className="flex-1 flex items-center rounded-full px-3 py-2 shadow-sm border border-gray-300 bg-white relative">
          <button
            type="button"
            onClick={() => setOpenPlus(!openPlus)}
            className="text-black hover:text-gray-700 mr-3"
          >
            {openPlus ? <FaTimes size={18} /> : <FaPlus size={18} />}
          </button>

          {openPlus && (
            <div className="absolute bottom-14 -left-10 bg-white border rounded-xl shadow-md w-48 p-1">
              <div className="px-2">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md">
                  <IoDocumentText className="text-lg text-purple-500" />
                  <span className="ml-3">Document</span>
                </button>
              </div>
              <div className="px-2">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md">
                  <IoMdPhotos className="text-lg text-blue-500" />
                  <span className="ml-3">Photos & videos</span>
                </button>
              </div>
              <div className="px-2">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md">
                  <IoPerson className="text-lg text-cyan-500" />
                  <span className="ml-3">Contact</span>
                </button>
              </div>
              <div className="px-2">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md">
                  <FaPoll className="text-lg text-yellow-500" />
                  <span className="ml-3">Poll</span>
                </button>
              </div>
              <div className="px-2">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md">
                  <MdEvent className="text-lg text-pink-500" />
                  <span className="ml-3">Event</span>
                </button>
              </div>
            </div>
          )}

          <button
            className="text-black mr-3"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaRegSmile />
          </button>

          <input
            type="text"
            className="flex-1 focus:outline-none bg-transparent"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          {newMessage.trim() === "" ? (
            <button className="text-black ml-3 hover:bg-green-600 hover:text-white py-2 px-2 rounded-full">
              <FaMicrophone className="text-lg" />
            </button>
          ) : (
            <button
              className="text-white bg-green-600 p-2 rounded-full ml-2"
              onClick={handleSendMessage}
            >
              <IoSend className="text-xl" />
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
