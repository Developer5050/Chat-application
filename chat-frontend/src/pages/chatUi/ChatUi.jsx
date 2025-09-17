import React, { useState, useEffect } from "react";
import SidebarLeft from "../../components/sidebarLeft/SidebarLeft"
import SidebarRight from "../../components/sidebarRight/SidebarRight";
import ChatArea from "../../components/chatArea/ChatArea";

const ChatUi = () => {
  const [chats] = useState([
    { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", time: "10:30 AM", unread: 3, online: true, type: "personal" },
    { id: 2, name: "Jane Smith", lastMessage: "See you tomorrow!", time: "9:15 AM", unread: 0, online: true, type: "personal" },
    { id: 3, name: "Work Group", lastMessage: "Alice: Meeting at 3 PM", time: "Yesterday", unread: 12, online: false, type: "group" },
    { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", time: "10:30 AM", unread: 3, online: true, type: "personal" },
    { id: 2, name: "Jane Smith", lastMessage: "See you tomorrow!", time: "9:15 AM", unread: 0, online: true, type: "personal" },
    { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", time: "10:30 AM", unread: 3, online: true, type: "personal" },
    { id: 2, name: "Jane Smith", lastMessage: "See you tomorrow!", time: "9:15 AM", unread: 0, online: true, type: "personal" },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there!", sender: "other", time: "10:25 AM" },
    { id: 2, text: "Hi! How are you?", sender: "me", time: "10:26 AM" },
  ]);

  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search or start a new chat");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredChats = chats.filter((chat) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return chat.unread > 0;
    if (activeFilter === "group") return chat.type === "group";
    return true;
  });

  useEffect(() => {
    if (filteredChats.length > 0 && activeChat === null) {
      setActiveChat(filteredChats[0].id);
    }
  }, [filteredChats, activeChat]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="flex h-screen bg-gray-100 font-ubuntu">
      <SidebarLeft />
      <SidebarRight
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        filteredChats={filteredChats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchPlaceholder={searchPlaceholder}
        setSearchPlaceholder={setSearchPlaceholder}
      />
      <ChatArea
        chats={chats}
        activeChat={activeChat}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ChatUi;
