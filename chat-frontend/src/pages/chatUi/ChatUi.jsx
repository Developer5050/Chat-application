import React, { useState } from 'react';

const ChatUi = () => {
  // Sample data for chats
  const [chats, setChats] = useState([
    { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", time: "10:30 AM", unread: 3, online: true },
    { id: 2, name: "Jane Smith", lastMessage: "See you tomorrow!", time: "9:15 AM", unread: 0, online: true },
    { id: 3, name: "Work Group", lastMessage: "Alice: Meeting at 3 PM", time: "Yesterday", unread: 12, online: false },
    { id: 4, name: "Mom", lastMessage: "Don't forget to call me", time: "Yesterday", unread: 0, online: false },
    { id: 5, name: "David Wilson", lastMessage: "Thanks for your help!", time: "Wednesday", unread: 1, online: true },
    { id: 6, name: "Sarah Johnson", lastMessage: "The package has arrived", time: "Tuesday", unread: 0, online: false },
    { id: 7, name: "Tech Support", lastMessage: "Your issue has been resolved", time: "Monday", unread: 0, online: false },
  ]);

  // Sample messages for active chat
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there!", sender: "other", time: "10:25 AM" },
    { id: 2, text: "Hi! How are you?", sender: "me", time: "10:26 AM" },
    { id: 3, text: "I'm good. Just working on a new project.", sender: "other", time: "10:28 AM" },
    { id: 4, text: "That's great! What kind of project?", sender: "me", time: "10:30 AM" },
    { id: 5, text: "It's a React application with Tailwind CSS", sender: "other", time: "10:32 AM" },
  ]);

  const [activeChat, setActiveChat] = useState(1);
  const [newMessage, setNewMessage] = useState("");

  // Function to handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  // Function to handle pressing Enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        {/* Sidebar header */}
        <div className="bg-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src="https://ui-avatars.com/api/?name=User&background=random"
              alt="User"
            />
            <span className="ml-3 font-semibold">Your Name</span>
          </div>
          <div className="flex space-x-4">
            <button className="text-gray-600">
              <i className="fas fa-comment-alt"></i>
            </button>
            <button className="text-gray-600">
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="p-3 bg-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              className="bg-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Search or start new chat"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div 
              key={chat.id} 
              className={`flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${activeChat === chat.id ? 'bg-green-50' : ''}`}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className="relative">
                <img
                  className="h-12 w-12 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${chat.name}&background=random`}
                  alt={chat.name}
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src={`https://ui-avatars.com/api/?name=${chats.find(chat => chat.id === activeChat)?.name}&background=random`}
              alt={chats.find(chat => chat.id === activeChat)?.name}
            />
            <div className="ml-3">
              <h3 className="font-semibold">{chats.find(chat => chat.id === activeChat)?.name}</h3>
              <p className="text-xs text-gray-600">
                {chats.find(chat => chat.id === activeChat)?.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button className="text-gray-600">
              <i className="fas fa-video"></i>
            </button>
            <button className="text-gray-600">
              <i className="fas fa-phone"></i>
            </button>
            <button className="text-gray-600">
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
          <div className="space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "me"
                      ? "bg-green-100 text-black"
                      : "bg-white"
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="text-xs text-gray-500 text-right mt-1">
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message input */}
        <div className="bg-gray-200 p-4 flex items-center">
          <div className="flex-1 flex items-center bg-white rounded-lg px-4 py-2">
            <button className="text-gray-500 mr-3">
              <i className="far fa-smile"></i>
            </button>
            <button className="text-gray-500 mr-3">
              <i className="fas fa-paperclip"></i>
            </button>
            <input
              type="text"
              className="flex-1 focus:outline-none"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button
            className="ml-4 bg-green-600 text-white p-3 rounded-full"
            onClick={handleSendMessage}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatUi;