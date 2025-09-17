import React from "react";
import { IoMdSearch } from "react-icons/io";
import { FaEllipsisVertical } from "react-icons/fa6";
import { MdOutlineGroupAdd, MdLogout } from "react-icons/md";
import Logo from "../../assets/logo2.jpeg";
import ChatList from "../chatList/ChatList"

const SidebarRight = ({
  isDropdownOpen,
  setIsDropdownOpen,
  filteredChats,
  activeChat,
  setActiveChat,
  activeFilter,
  setActiveFilter,
  searchPlaceholder,
  setSearchPlaceholder,
}) => {
  return (
    <div className="w-1/3 bg-white flex flex-col border-r">
      {/* Header */}
      <div className="p-3 flex justify-between items-center h-16">
        <img src={Logo} alt="Logo" width={50} height={50} />
        <div className="relative">
          <button
            className="text-black mt-1"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaEllipsisVertical />
          </button>
          {isDropdownOpen && (
            <div className="absolute -right-6 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
              <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                <MdOutlineGroupAdd className="text-lg" />
                <span className="ml-2">New Group</span>
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                <MdLogout className="text-lg" />
                <span className="ml-2">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative p-3 bg-white">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <IoMdSearch className="mt-0.5 ml-3" />
        </div>
        <input
          type="text"
          className="bg-white text-sm w-full pl-7 pr-2 py-2 rounded-full 
             border border-transparent hover:border-gray-400 
             focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          placeholder={searchPlaceholder}
        />
      </div>

      {/* Filter buttons */}
      <div className="flex p-3 bg-white space-x-4 text-sm font-medium">
        {["all", "unread", "group"].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-1 rounded-full border transition-colors ${
              activeFilter === filter
                ? "border-green-600 text-green-600 bg-green-50"
                : "border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveFilter(filter);
              setSearchPlaceholder(
                filter === "all"
                  ? "Search or start a new chat"
                  : filter === "unread"
                  ? "Search unread chats"
                  : "Search groups"
              );
            }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <ChatList
        filteredChats={filteredChats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
      />
    </div>
  );
};

export default SidebarRight;
