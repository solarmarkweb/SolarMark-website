import axios from "axios";

const api = axios.create({
  baseURL: "https://admin-backend-591983072009.asia-south1.run.app/api",
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

        const res = await axios.post(
          "https://admin-backend-591983072009.asia-south1.run.app/api/refresh",
          { refresh_token: refreshToken }
        );

        localStorage.setItem("auth_token", res.data.access_token);

        originalRequest.headers.Authorization =
          `Bearer ${res.data.access_token}`;

        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
