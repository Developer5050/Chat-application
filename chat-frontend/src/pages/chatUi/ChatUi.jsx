import React, { useState, useEffect, useMemo, useCallback } from "react";
import SidebarLeft from "../../components/sidebarLeft/SidebarLeft";
import SidebarRight from "../../components/sidebarRight/SidebarRight";
import ChatArea from "../../components/chatArea/ChatArea";

const ChatUi = () => {
  // Dummy Chats (replace with API later)
  const [chats] = useState([
    {
      id: 1,
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      time: "10:30 AM",
      unread: 3,
      online: true,
      type: "personal",
    },
    {
      id: 2,
      name: "Jane Smith",
      lastMessage: "See you tomorrow!",
      time: "9:15 AM",
      unread: 0,
      online: true,
      type: "personal",
    },
    {
      id: 3,
      name: "Work Group",
      lastMessage: "Alice: Meeting at 3 PM",
      time: "Yesterday",
      unread: 12,
      online: false,
      type: "group",
    },
  ]);

  // Dummy Messages (replace with API later)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there!",
      sender: "other",
      time: "10:25 AM",
      status: "sent",
    },
    {
      id: 2,
      text: "Hi! How are you?",
      sender: "me",
      time: "10:26 AM",
      status: "seen",
    },
  ]);

  const [activeChat, setActiveChat] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    "Search or start a new chat"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeView, setActiveView] = useState("chats");

  // ✅ Memoized filtered chats
  const filteredChats = useMemo(() => {
    switch (activeFilter) {
      case "unread":
        return chats.filter((chat) => chat.unread > 0);
      case "group":
        return chats.filter((chat) => chat.type === "group");
      default:
        return chats;
    }
  }, [activeFilter, chats]);

  // ✅ Auto-select first available chat
  useEffect(() => {
    if (filteredChats.length > 0 && !activeChat) {
      setActiveChat(filteredChats[0]); // object
    }
  }, [filteredChats, activeChat]);

  // ✅ Optimized send message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    const newMsg = {
      id: Date.now(),
      text: newMessage,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
  }, [newMessage]);

  // ✅ Optimized keypress
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") handleSendMessage();
    },
    [handleSendMessage]
  );

  // ✅ Get logged in user
  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex h-screen bg-gray-100 font-ubuntu">
      {/* Left Sidebar */}
      <SidebarLeft setActiveView={setActiveView} />

      {/* Right Sidebar */}
      <SidebarRight
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        filteredChats={filteredChats}
        activeChat={activeChat ? [activeChat] : []} 
        setActiveChat={setActiveChat}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchPlaceholder={searchPlaceholder}
        setSearchPlaceholder={setSearchPlaceholder}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Chat Area */}
      <ChatArea
        chats={chats}
        activeChat={activeChat}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        activeView={activeView}
        userId={currentUser?.id}
      />
    </div>
  );
};

export default ChatUi;
