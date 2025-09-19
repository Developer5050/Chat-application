import React, { useState, useEffect } from "react";
import { IoMdSearch } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { FaTimes } from "react-icons/fa";
import {
  sendInvite,
  getReceivedInvites,
  acceptInvite,
  rejectInvite,
} from "../../services/inviteService";

const InviteView = ({ setActiveView }) => {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = localStorage.getItem("userId"); // Logged-in user

  useEffect(() => {
    fetchRequests();
  }, []);

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
      await acceptInvite(inviteId);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (inviteId) => {
    try {
      await rejectInvite(inviteId);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
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
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="flex justify-between items-center border p-2 rounded-md"
                >
                  <span>{req.from.email}</span>
                  <div className="flex space-x-2">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 text-sm"
                      onClick={() => handleAccept(req._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 text-sm"
                      onClick={() => handleReject(req._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteView;
