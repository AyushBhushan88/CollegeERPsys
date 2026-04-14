import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  const tenantId = Cookies.get("tenantId");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }

  return config;
});

export default api;
