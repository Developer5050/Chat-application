import React, { useState, useEffect, useMemo, memo } from "react";
import { IoMdSearch } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { FaTimes, FaPencilAlt, FaEllipsisV } from "react-icons/fa";
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
  // 🔹 Profile State
  const [name, setName] = useState("Ahmad Shoukat");
  const [about, setAbout] = useState("Available");
  const [phone, setPhone] = useState("+92 300 1234567");

  // 🔹 Invite State
  const [receiverEmail, setReceiverEmail] = useState("");
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { logout } = useLogout();
  const userId = useMemo(() => localStorage.getItem("userId"), []);

  useEffect(() => {
    if (activeView === "invite") fetchRequests();
  }, [activeView]);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id || currentUser?.id;

  const fetchRequests = async () => {
    try {
      const res = await getReceivedInvites(userId);
      const validRequests = res.filter(
        (invite) => invite.sender && invite.receiver
      );
      setRequests(validRequests);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvite = async () => {
    if (!receiverEmail) return;
    try {
      await sendInvite(receiverEmail);
      setReceiverEmail("");
      setIsModalOpen(false);
      fetchRequests();
      alert("Invite sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Error sending invite");
    }
  };

  const handleAccept = async (inviteId) => {
    try {
      const data = await acceptInvite(inviteId);

      // Remove invite from list
      setRequests((prev) => prev.filter((req) => req._id !== inviteId));

      // ✅ Use full user objects from backend
      const newChat = {
        _id: data.chatId,
        participants: [
          { _id: data.sender._id, name: data.sender.name },
          { _id: data.receiver._id, name: data.receiver.name },
        ],
        messages: [],
      };

      // Add to active chats
      setActiveChat((prev) => [...prev, newChat]);

      alert("Invite accepted! Chat created.");
    } catch (err) {
      console.error("Error accepting invite:", err);
      alert(err.response?.data?.message || "Error accepting invite");
    }
  };

  const handleReject = async (inviteId) => {
    try {
      await rejectInvite(inviteId);

      setRequests((prev) => prev.filter((req) => req._id !== inviteId));

      alert("Invite rejected!");
    } catch (err) {
      console.error("Error rejecting invite:", err);
      alert(err.response?.data?.message || "Error rejecting invite");
    }
  };

  const getDisplayEmail = (invite) => {
    if (!invite.sender || !invite.receiver) return "";
    // const isReceiver = invite.receiver._id?.toString() === userId;
    const isSender = invite.sender._id?.toString() === userId;
    return isSender ? invite.receiver.email : invite.sender.email;
  };

  const getStatusText = (invite) => {
    const isSender = invite.sender._id?.toString() === userId;
    return isSender ? "Pending" : invite.status;
  };

  // 🔹 JSX for Profile Inputs
  const renderProfileInput = (label, value, setValue) => (
    <div className="px-6 mt-6 w-full">
      <label className="text-sm text-gray-500">{label}</label>
      <div className="flex items-center border-b py-2">
        <input
          type="text"
          className="flex-1 outline-none text-gray-800"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <FaPencilAlt className="text-gray-500 cursor-pointer ml-2" />
      </div>
    </div>
  );

  // 🔹 Invite List JSX
  const renderInviteList = () => (
    <div className="flex flex-col space-y-2 max-h-80 overflow-y-auto mt-2">
      {requests.length === 0 ? (
        <p className="text-gray-500 text-sm">No pending requests</p>
      ) : (
        requests.map((invite) => {
          const isReceiver = invite.receiver._id?.toString() === userId;
          return (
            <div
              key={invite._id}
              className="flex justify-between items-center border p-2 rounded-md"
            >
              <span className="text-sm">
                {getDisplayEmail(invite)}{" "}
                {invite.sender._id?.toString() === userId && (
                  <span className="text-gray-400 text-xs ml-2">
                    ({getStatusText(invite)})
                  </span>
                )}
              </span>
              {isReceiver && (
                <div className="flex space-x-2">
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 text-xs"
                    onClick={() => handleAccept(invite._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 text-xs"
                    onClick={() => handleReject(invite._id)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="w-1/3 bg-white flex flex-col border-r custom-width">
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

          {renderProfileInput("Name", name, setName)}
          {renderProfileInput("About", about, setAbout)}
          {renderProfileInput("Phone", phone, setPhone)}
        </>
      ) : activeView === "invite" ? (
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
              onClick={() => setIsModalOpen(true)}
            >
              Invite
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mt-2.5 mb-7">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <IoMdSearch className="mt-0.5 ml-3" />
            </div>
            <input
              type="text"
              className="bg-white text-sm w-full pl-9 pr-2 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Search requests"
            />
          </div>

          {/* Requests Badge */}
          <div className="mb-3">
            <span className="bg-gray-200 px-3 py-1 rounded-full text-gray-700 text-sm">
              Requests ({requests.length})
            </span>
          </div>

          {renderInviteList()}

          {/* Modal for Sending Invite */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white w-96 rounded-xl p-6 relative shadow-lg">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                  onClick={() => setIsModalOpen(false)}
                >
                  <FaTimes size={18} />
                </button>
                <h3 className="text-lg font-semibold mb-4">Invite Users</h3>
                <div className="flex mb-4">
                  <input
                    type="email"
                    placeholder="Enter user email"
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 outline-none focus:ring-1 focus:ring-green-500"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                  />
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
                    onClick={handleSendInvite}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Normal Chat Sidebar */}
          <div className="p-3 flex justify-between items-center h-16">
            <img src={Logo} alt="Logo" width={50} height={50} />
            <div className="relative">
              <button
                className="text-black mt-1"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <FaEllipsisV />
              </button>
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
            filteredChats={activeChat}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            currentUserId={currentUserId}
          />
        </>
      )}
    </div>
  );
};

export default memo(SidebarRight);
