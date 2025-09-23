import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all chats for current user
export const getChats = async () => {
  const { data } = await api.get("/chats/");
  return data;
};

// Get specific chat
export const getChat = async (chatId) => {
  const { data } = await api.get(`/chats/${chatId}`);
  return data;
};

// Send message
export const sendMessage = async (chatId, text) => {
  const { data } = await api.post(`/chats/${chatId}/message`, { text });
  return data;
};

// Create or get direct chat
export const createOrGetChat = async (userId) => {
  const { data } = await api.post(`/chats/direct/${userId}`);
  return data;
};

// Get or create direct chat (alternative)
// export const getOrCreateDirectChat = async (userId) => {
//   const { data } = await api.get(`/chats/direct/${userId}`);
//   return data;
// };
