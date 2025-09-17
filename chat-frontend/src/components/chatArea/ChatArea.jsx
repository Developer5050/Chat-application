import React from "react";
import { PiVideoCameraFill } from "react-icons/pi";
import { MdLocalPhone } from "react-icons/md";
import { FaEllipsisVertical, FaPlus, FaMicrophone } from "react-icons/fa6";
import { FaRegSmile } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import whatsappBg from "../../assets/whatsapp1.jpg";

const ChatArea = ({
  chats,
  activeChat,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyPress,
}) => {
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

        <div className="flex space-x-2">
          <button className="text-black w-10 h-10 flex items-center justify-center text-xl">
            <PiVideoCameraFill />
          </button>
          <button className="text-black w-10 h-10 flex items-center justify-center text-xl">
            <MdLocalPhone />
          </button>
          <button className="text-black w-10 h-10 flex items-center justify-center text-xl">
            <FaEllipsisVertical />
          </button>
        </div>
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
      <div className="p-4 flex items-center">
        <div className="flex-1 flex items-center bg-white rounded-full px-4 py-1 shadow-sm border border-gray-300">
          <button className="text-gray-500 mr-3">
            <FaPlus />
          </button>
          <button className="text-gray-500 mr-3">
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
            <button className="text-gray-500 ml-3 py-2 px-2 rounded-full hover:bg-green-700 hover:text-white">
              <FaMicrophone className="text-lg" />
            </button>
          ) : (
            <button
              className="text-white bg-green-600 py-2 px-2 rounded-full ml-2"
              onClick={handleSendMessage}
            >
              <IoSend className="text-xl" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
