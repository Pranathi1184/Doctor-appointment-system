import axios from "axios";
import { getToken, logout } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // If token is invalid/expired, log out to avoid stuck UI
    if (err?.response?.status === 401) logout();
    return Promise.reject(err);
  }
);

export default api;

