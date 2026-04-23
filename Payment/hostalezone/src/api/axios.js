import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Fallback headers are only needed for temporary local sessions.
    const user = getStoredUser();
    const userId = user.id || user._id || "";

    if (userId) {
      config.headers["X-User-Id"] = userId;
    }

    if (user.email) {
      config.headers["X-User-Email"] = user.email;
    }

    if (user.itNumber) {
      config.headers["X-User-It-Number"] = user.itNumber;
    }

    if (user.userType) {
      config.headers["X-User-Type"] = user.userType;
    }

    if (user.fullName) {
      config.headers["X-User-Name"] = user.fullName;
    }
  }

  return config;
});
