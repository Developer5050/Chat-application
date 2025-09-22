import React, { memo } from "react";

const ChatList = ({
  filteredChats = [],
  activeChat,
  setActiveChat,
  currentUserId,
}) => {
  const getChatName = (chat) => {
    if (chat.name) return chat.name; // group chat
    if (chat.participants && chat.participants.length > 0) {
      const otherUser = chat.participants.find((p) => p._id !== currentUserId);
      return otherUser ? otherUser.name : "Unknown";
    }
    return "Unknown";
  };
  return (
    <div className="flex-1 overflow-y-auto mt-2">
      {filteredChats.slice(0, 11).map((chat) => (
        <div
          key={chat._id}
          className={`p-2 cursor-pointer ${
            activeChat?._id === chat._id ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveChat(chat)}
        >
          <div className="flex items-center">
            <div className="relative">
              <img
                className="h-10 w-10 rounded-full"
                src={`https://ui-avatars.com/api/?name=${getChatName(
                  chat,
                  currentUserId
                )}&background=random`}
                alt={getChatName(chat, currentUserId)}
              />
              {chat.online && (
                <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border border-gray-700"></div>
              )}
            </div>
            <div className="ml-2 flex-1 min-w-0">
              <div className="flex justify-between items-center mt-1.5">
                <h3 className="text-black text-[15px] font-medium truncate">
                 {getChatName(chat)}
                </h3>

                <span className="text-xs text-black">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[13px] text-gray-600 truncate">
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="bg-green-600 text-white text-xs h-4 w-4 flex items-center justify-center rounded-full">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(ChatList);
