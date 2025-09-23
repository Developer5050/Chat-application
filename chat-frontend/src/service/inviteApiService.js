import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Create axios instance with baseURL
const api = axios.create({
  baseURL: API_BASE,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 1. Send Invite
export const sendInvite = async (email) => {
  if (!email) throw new Error("Email is required");
  const { data } = await api.post("/invites/send", { email });
  return data;
};

// 2. Get All Invites for Current User
export const getReceivedInvites = async () => {
  const { data } = await api.get("/invites/");
  return data;
};

// 3. Get Specific Invite
export const getInvite = async (inviteId) => {
  const { data } = await api.get(`/invites/${inviteId}`);
  return data;
};

// 4. Accept Invite
export const acceptInvite = async (inviteId) => {
  const { data } = await api.post(`/invites/accept/${inviteId}`);
  return data;
};

// 5. Reject Invite
export const rejectInvite = async (inviteId) => {
  const { data } = await api.post(`/invites/reject/${inviteId}`);
  return data;
};

// 6. Cancel Invite
export const cancelInvite = async (inviteId) => {
  const { data } = await api.delete(`/invites/cancel/${inviteId}`);
  return data;
};
