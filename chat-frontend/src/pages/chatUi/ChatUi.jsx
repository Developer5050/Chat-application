import React, { useState, useEffect, useCallback } from "react";
import SidebarRight from "../../components/sidebarRight/SidebarRight";
import SidebarLeft from "../../components/sidebarLeft/SidebarLeft";
import ChatArea from "../../components/chatArea/ChatArea";
import { getChats } from "../../service/chatApiService";


const ChatUi = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeView, setActiveView] = useState("chats");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    "Search or start a new chat"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id || user?.id;

  // Fetch chats from API
  const fetchChats = useCallback(async () => {
   try {
    console.log("Fetching chats...");
    const response = await getChats();
    console.log("Chats fetched:", response);
    setChats(response.chats || []);
  } catch (error) {
    console.error("Error fetching chats:", error);
  }
  }, []);

  // Load chats on component mount
  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId, fetchChats]);

  // Handle new chat creation (when invite is accepted)
  const handleNewChat = useCallback((newChat) => {
    setChats((prevChats) => {
      // Check if chat already exists to avoid duplicates
      const exists = prevChats.some((chat) => chat._id === newChat._id);
      if (exists) {
        return prevChats;
      }
      return [newChat, ...prevChats];
    });
    setActiveChat(newChat);
    setActiveView("chats");
  }, []);

  // Handle key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // This will be handled in ChatArea component
    }
  };

  // Filter chats based on active filter
  const filteredChats = useCallback(() => {
    if (!chats.length) return [];

    switch (activeFilter) {
      case "unread":
        return chats.filter((chat) => chat.unreadCount > 0);
      case "group":
        return chats.filter((chat) => chat.type === "group");
      case "all":
      default:
        return chats;
    }
  }, [chats, activeFilter]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to access chats</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarLeft setActiveView={setActiveView} />
      <SidebarRight
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        filteredChats={filteredChats()}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchPlaceholder={searchPlaceholder}
        setSearchPlaceholder={setSearchPlaceholder}
        activeView={activeView}
        setActiveView={setActiveView}
        onNewChat={handleNewChat} // Pass the callback to handle new chats
        fetchChats={fetchChats} // Pass the fetch function to refresh chats
        chats={chats} // Pass the actual chats array
      />

      {/* Chat Area */}
      <ChatArea
        chats={chats}
        activeChat={activeChat}
        messages={messages}
        setMessages={setMessages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleKeyPress={handleKeyPress}
        activeView={activeView}
        userId={userId}
      />
    </div>
  );
};

export default ChatUi;
