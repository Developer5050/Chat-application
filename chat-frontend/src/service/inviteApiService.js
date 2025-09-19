import axios from "axios";

const API = "http://localhost:5000/api/invite";

// Create axios instance with baseURL
const api = axios.create({
  baseURL: API,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 1. Send Invite (only receiverEmail needed)
export const sendInvite = async (receiverEmail) => {
  const { data } = await api.post("/send", { receiverEmail });
  return data;
};

// 2. Get All Received Invites
export const getReceivedInvites = async (userId) => {
  const { data } = await api.get(`/${userId}`); // ✅ use the axios instance
  console.log("Received invites:", data);
  return data;
};

// 3. Accept Invite
export const acceptInvite = async (inviteId) => {
  const { data } = await api.put(`/accept/${inviteId}`);
  return data;
};

// 4. Reject Invite
export const rejectInvite = async (inviteId) => {
  const { data } = await api.put(`/reject/${inviteId}`);
  return data;
};
