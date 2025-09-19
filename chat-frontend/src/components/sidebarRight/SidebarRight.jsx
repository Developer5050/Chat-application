import React, { useState, useEffect } from "react";
import { IoMdSearch } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { FaTimes, FaPencilAlt } from "react-icons/fa";
import { MdOutlineGroupAdd, MdLogout } from "react-icons/md";
import Logo from "../../assets/logo2.jpeg";
import ChatList from "../chatList/ChatList";
import useLogout from "../../hooks/useLogoutHook";
import {
  sendInvite,
  getReceivedInvites,
  acceptInvite,
  rejectInvite,
} from "../../service/inviteApiService";

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
  activeView,
  setActiveView,
}) => {
  const [name, setName] = useState("Ahmad Shoukat");
  const [about, setAbout] = useState("Available");
  const [phone, setPhone] = useState("+92 300 1234567");

  const [receiverEmail, setReceiverEmail] = useState("");
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { logout } = useLogout();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (activeView === "invite") fetchRequests();
  }, [activeView]);

  const fetchRequests = async () => {
    try {
      const res = await getReceivedInvites(userId);
      setRequests(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvite = async () => {
    if (!receiverEmail) return;
    try {
      await sendInvite(receiverEmail);
      setReceiverEmail("");
      fetchRequests();
      alert("Invite sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Error sending invite");
    }
  };

  const handleAccept = async (inviteId) => {
    try {
      await acceptInvite(inviteId); // Backend marks as accepted & removes invite
      fetchRequests(); // Refresh invite modal
      // Optionally refresh chat list if you have a fetchChats() or update state
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (inviteId) => {
    try {
      await rejectInvite(inviteId); // Backend removes invite
      fetchRequests(); // Refresh invite modal
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-1/3 bg-white flex flex-col border-r custom-width">
      {/* 🔹 Profile View */}
      {activeView === "profile" ? (
        <>
          <div className="flex items-center px-4 py-3">
            <button
              onClick={() => setActiveView("chats")}
              className="mr-3 text-black py-2 px-2 rounded-full hover:bg-gray-200"
            >
              <IoArrowBack size={22} />
            </button>
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          <div className="flex flex-col items-center mt-6">
            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl cursor-pointer hover:opacity-80">
              +
            </div>
            <p className="text-sm text-gray-500 mt-2">Tap to change photo</p>
          </div>

          <div className="px-6 mt-10 w-full">
            <label className="text-sm text-gray-500">Name</label>
            <div className="flex items-center border-b py-2">
              <input
                type="text"
                className="flex-1 outline-none text-gray-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FaPencilAlt className="text-gray-500 cursor-pointer ml-2" />
            </div>
          </div>

          <div className="px-6 mt-6 w-full">
            <label className="text-sm text-gray-500">About</label>
            <div className="flex items-center border-b py-2">
              <input
                type="text"
                className="flex-1 outline-none text-gray-800"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
              <FaPencilAlt className="text-gray-500 cursor-pointer ml-2" />
            </div>
          </div>

          <div className="px-6 mt-6 w-full">
            <label className="text-sm text-gray-500">Phone</label>
            <div className="flex items-center border-b py-2">
              <input
                type="text"
                className="flex-1 outline-none text-gray-800"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <FaPencilAlt className="text-gray-500 cursor-pointer ml-2" />
            </div>
          </div>
        </>
      ) : activeView === "invite" ? (
        // 🔹 Invite View
        <div className="p-4 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveView("chats")}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <IoArrowBack size={22} />
              </button>
              <h2 className="text-lg font-semibold">Invite</h2>
            </div>
            <button
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
              onClick={handleSendInvite}
            >
              Invite
            </button>
          </div>

          {/* Search + Send */}
          <div className="relative p-5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoMdSearch className="text-gray-500 ml-5" />
            </div>
            <input
              type="email"
              placeholder="Enter user email to invite"
              className="bg-white text-sm w-full pl-9 pr-3 py-2 rounded-full border border-transparent hover:border-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
            />
          </div>

          {/* Request Button */}
          <button
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 w-fit mt-3"
            onClick={() => setIsModalOpen(true)}
          >
            Requests ({requests.length})
          </button>

          {/* Requests Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
              <div className="bg-white w-96 rounded-xl p-4 relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                  onClick={() => setIsModalOpen(false)}
                >
                  <FaTimes />
                </button>
                <h3 className="text-lg font-semibold mb-3">Pending Requests</h3>

                {requests.length === 0 && <p>No pending requests</p>}

                <div className="flex flex-col space-y-2 max-h-64 overflow-y-auto">
                  {requests.map((invite) => {
                    const isReceiver =
                      invite.receiver?._id?.toString() === userId;
                      
                    const displayEmail =
                      invite.sender?._id?.toString() === userId
                        ? invite.receiver?.email
                        : invite.sender?.email;

                    return (
                      <div
                        key={invite._id}
                        className="flex justify-between items-center border p-2 rounded-md"
                      >
                        <span>{displayEmail}</span>
                        {isReceiver && (
                          <div className="flex space-x-2">
                            <button
                              className="bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 text-sm"
                              onClick={() => handleAccept(invite._id)}
                            >
                              Accept
                            </button>
                            <button
                              className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 text-sm"
                              onClick={() => handleReject(invite._id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // 🔹 Normal Chat Sidebar View
        <>
          <div className="p-3 flex justify-between items-center h-16">
            <img src={Logo} alt="Logo" width={50} height={50} />
            <div className="relative">
              <button
                className="text-black mt-1"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              ></button>
              {isDropdownOpen && (
                <div className="absolute -right-6 mt-2 w-44 bg-white rounded-lg shadow-lg py-1 z-10">
                  <div className="px-2">
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full rounded-md">
                      <MdOutlineGroupAdd className="text-lg" />
                      <span className="ml-2">New Group</span>
                    </button>
                  </div>
                  <div className="px-2">
                    <button
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full rounded-md"
                      onClick={logout}
                    >
                      <MdLogout className="text-lg" />
                      <span className="ml-2">Logout</span>
                    </button>
                  </div>
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
              className="bg-white text-sm w-full pl-7 pr-2 py-2 rounded-full border border-transparent hover:border-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
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

          {/* Chat List */}
          <ChatList
            filteredChats={filteredChats}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
          />
        </>
      )}
    </div>
  );
};

export default SidebarRight;
