import axios from "axios";

// Access environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8002/api";
const LOGIN_REDIRECT = process.env.NEXT_PUBLIC_LOGIN_REDIRECT || "/login";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        // Use the environment-based API base URL
        const res = await axios.post(
          `${API_BASE_URL}/refresh`,
          { refresh_token: refreshToken }
        );

        localStorage.setItem("auth_token", res.data.access_token);

        originalRequest.headers.Authorization =
          `Bearer ${res.data.access_token}`;

        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = LOGIN_REDIRECT;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
