import React, { useState, useEffect, useMemo, memo } from "react";
import { IoMdSearch } from "react-icons/io";
import SidebarLeft from "../sidebarLeft/SidebarLeft";
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
  cancelInvite,
} from "../../service/inviteApiService";
// import { getOrCreateDirectChat, getChats } from "../../service/chatApiService";

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
  onNewChat,
  fetchChats,
  chats,
}) => {
  // 🔹 Profile State
  const [name, setName] = useState("Ahmad Shoukat");
  const [about, setAbout] = useState("Available");
  const [phone, setPhone] = useState("+92 300 1234567");

  // 🔹 Invite State
  const [receiverEmail, setReceiverEmail] = useState("");
  const [invites, setInvites] = useState({
    receivedInvites: [],
    sentInvites: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { logout } = useLogout();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (activeView === "invite") {
      fetchInvites();
    }
  }, [activeView]);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await getReceivedInvites();
      setInvites(res);
    } catch (err) {
      console.error("Error fetching invites:", err);
      alert(err.response?.data?.message || "Error fetching invites");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!receiverEmail) {
      alert("Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      await sendInvite(receiverEmail);
      setReceiverEmail("");
      setIsModalOpen(false);
      await fetchInvites(); // Refresh the invites list
      alert("Invite sent successfully!");
    } catch (err) {
      console.error("Error sending invite:", err);
      alert(err.response?.data?.message || "Error sending invite");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Chat Open Handler
  const handleChatOpen = async (user) => {
    try {
      if (user._id === currentUserId) {
        console.warn("⚠️ Cannot start chat with yourself");
        return;
      }

      // Use the POST endpoint, not GET
      const res = await createOrGetChat(user._id);
      console.log("Chat creation response:", res);

      const newChat = {
        _id: res.chat._id,
        participants: res.chat.participants,
        messages: res.chat.messages || [],
        type: res.chat.type || "direct",
      };

      // Update the active chat
      setActiveChat(newChat);

      // Refresh the chats list
      if (fetchChats) {
        await fetchChats();
      }

      console.log("✅ Chat opened with:", user.username);
    } catch (err) {
      console.error("❌ Error opening chat:", err);
      console.error("❌ Error details:", err.response?.data || err.message);

      if (err.response?.status === 404) {
        alert("Chat endpoint not found. Please check backend routes.");
      } else {
        alert(err.response?.data?.message || "Error opening chat");
      }
    }
  };

  const handleAccept = async (inviteId, sender) => {
    try {
      console.log("Accepting invite:", inviteId);
      setLoading(true);
      const res = await acceptInvite(inviteId);
      console.log("Invite accepted response:", res);

      // Remove the accepted invite from the list
      setInvites((prev) => ({
        ...prev,
        receivedInvites: prev.receivedInvites.filter(
          (invite) => invite._id !== inviteId
        ),
      }));

      // Refresh the chats list
      if (fetchChats) {
        await fetchChats(); // Wait for chats to be fetched
      }

      // If it's a one-on-one invite, find and set the active chat
      if (res.inviteType === "one-on-one" && res.chat) {
        // Use the onNewChat callback if provided
        if (onNewChat) {
          onNewChat(res.chat);
        } else {
          // Fallback: manually add to active chat
          setActiveChat((prev) => {
            const exists = prev.some((chat) => chat._id === res.chat._id);
            return exists ? prev : [...prev, res.chat];
          });
        }
      }

      alert("Invite accepted successfully! Chat created.");
    } catch (error) {
      console.error("Error accepting invite:", error);
      alert(error.response?.data?.message || "Error accepting invite");
    } finally {
      setLoading(false);
    }
  };
  const handleReject = async (inviteId) => {
    try {
      setLoading(true);
      await rejectInvite(inviteId);

      // Remove the rejected invite from the list
      setInvites((prev) => ({
        ...prev,
        receivedInvites: prev.receivedInvites.filter(
          (invite) => invite._id !== inviteId
        ),
      }));

      alert("Invite rejected!");
    } catch (err) {
      console.error("Error rejecting invite:", err);
      alert(err.response?.data?.message || "Error rejecting invite");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (inviteId) => {
    try {
      setLoading(true);
      await cancelInvite(inviteId);

      // Remove the cancelled invite from the list
      setInvites((prev) => ({
        ...prev,
        sentInvites: prev.sentInvites.filter(
          (invite) => invite._id !== inviteId
        ),
      }));

      alert("Invite cancelled!");
    } catch (err) {
      console.error("Error cancelling invite:", err);
      alert(err.response?.data?.message || "Error cancelling invite");
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-4">
      {/* Received Invites */}
      <div>
        <h3 className="text-md font-semibold mb-2">
          Received Invites ({invites.receivedInvites?.length || 0})
        </h3>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {invites.receivedInvites?.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending invites</p>
          ) : (
            invites.receivedInvites?.map((invite) => (
              <div
                key={invite._id}
                className="flex justify-between items-center border p-3 rounded-md bg-gray-50"
              >
                <div>
                  <p className="font-medium">{invite.sender?.username}</p>
                  <p className="text-sm text-gray-600">
                    {invite.sender?.email}
                  </p>
                  {invite.chat && (
                    <p className="text-xs text-gray-500">
                      {invite.inviteType === "group"
                        ? `Group: ${invite.chat.name}`
                        : "One-on-One"}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={loading}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-xs disabled:opacity-50"
                    onClick={() => handleAccept(invite._id, invite.sender)}
                  >
                    Accept
                  </button>
                  <button
                    disabled={loading}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-xs disabled:opacity-50"
                    onClick={() => handleReject(invite._id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sent Invites */}
      <div>
        <h3 className="text-md font-semibold mb-2">
          Sent Invites ({invites.sentInvites?.length || 0})
        </h3>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {invites.sentInvites?.length === 0 ? (
            <p className="text-gray-500 text-sm">No sent invites</p>
          ) : (
            invites.sentInvites?.map((invite) => (
              <div
                key={invite._id}
                className="flex justify-between items-center border p-3 rounded-md bg-gray-50"
              >
                <div>
                  <p className="font-medium">{invite.receiver?.username}</p>
                  <p className="text-sm text-gray-600">
                    {invite.receiver?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {invite.status}
                  </p>
                </div>
                <button
                  disabled={loading}
                  className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-xs disabled:opacity-50"
                  onClick={() => handleCancel(invite._id)}
                >
                  Cancel
                </button>
              </div>
            ))
          )}
        </div>
      </div>
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
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveView("chats")}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <IoArrowBack size={22} />
              </button>
              <h2 className="text-lg font-semibold">Invites</h2>
            </div>
            <button
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              onClick={() => setIsModalOpen(true)}
            >
              Send Invite
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          )}

          {/* Invites Content */}
          <div className="flex-1 overflow-y-auto mt-4">
            {renderInviteList()}
          </div>

          {/* Modal for Sending Invite */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white w-96 rounded-xl p-6 relative shadow-lg">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                >
                  <FaTimes size={18} />
                </button>
                <h3 className="text-lg font-semibold mb-4">Send Invite</h3>
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Enter user email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-green-500"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendInvite()}
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                    onClick={handleSendInvite}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Invite"}
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
                    <button
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-full rounded-md"
                      onClick={() => setActiveView("invite")}
                    >
                      <MdOutlineGroupAdd className="text-lg" />
                      <span className="ml-2">Invite Users</span>
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
            filteredChats={chats}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            currentUserId={currentUserId}
            onChatOpen={handleChatOpen}
          />
        </>
      )}
    </div>
  );
};

export default memo(SidebarRight);
