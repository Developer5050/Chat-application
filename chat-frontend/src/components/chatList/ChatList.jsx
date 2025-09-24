import React from "react";

const ChatList = ({
  filteredChats,
  activeChat,
  setActiveChat,
  currentUserId,
}) => {
  // Function to get display name for chat
  const getChatDisplayName = (chat) => {
    if (!chat?.participants) return "Unknown Chat";

    if (chat.type === "direct") {
      const otherUser = chat.participants.find((p) => p?._id !== currentUserId);
      return otherUser?.username || "Unknown User";
    } else if (chat.type === "group") {
      return chat.name || "Group Chat";
    }
    return "Unknown Chat";
  };

  // Function to get last message preview
  const getLastMessage = (chat) => {
    if (Array.isArray(chat.messages) && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      return lastMsg?.text || "Media message";
    }
    return chat.lastMessage || "No messages yet";
  };

  return (
    <div className="flex flex-col overflow-y-auto">
      {Array.isArray(filteredChats) && filteredChats.length > 0 ? (
        filteredChats.map((chat) => {
          if (!chat?._id) return null;

          const displayName = getChatDisplayName(chat);
          const lastMessage = getLastMessage(chat);

          return (
            <div
              key={chat._id}
              className={`flex items-center p-3 border-b hover:bg-gray-100 cursor-pointer ${
                activeChat?._id === chat._id ? "bg-gray-200" : ""
              }`}
              onClick={() => {
                // Open this chat & reset unread count
                setActiveChat({ ...chat, unreadCount: 0 });
              }}
            >
              {/* Chat avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg mr-3">
                {displayName.charAt(0).toUpperCase()}
              </div>

              {/* Chat info */}
              <div className="flex-1 min-w-0">
                {/* Top row: Name + Time */}
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-800 truncate">
                    {displayName}
                  </p>
                  {chat.updatedAt && (
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(chat.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                {/* Bottom row: Last message + Unread badge */}
                <div className="flex justify-between items-center mt-0.5">
                  <p className="text-xs text-gray-500 truncate flex-1">
                    {lastMessage}
                  </p>

                  {chat.unreadCount > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>

                {/* Group info */}
                {chat.type === "group" && (
                  <p className="text-xs text-gray-400 mt-1">
                    {chat.participants?.length || 0} participants
                  </p>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <p className="text-sm mb-2">No chats available</p>
          <p className="text-xs text-center">
            Start a conversation by sending an invite to someone!
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
