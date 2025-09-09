import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  // Add authorization token
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add store-id header for store-specific requests
  const currentStore = localStorage.getItem("currentStore");
  if (currentStore) {
    try {
      const store = JSON.parse(currentStore);
      if (store?.id) {
        config.headers["store-id"] = store.id;
      }
    } catch (error) {
      console.error("Error parsing current store:", error);
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/user/refresh-token");
        const { accessToken } = response.data.data;
        
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Clear all storage on refresh token failure
        localStorage.clear();
        delete api.defaults.headers.common["Authorization"];
        delete api.defaults.headers.common["store-id"];
        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle store access errors
    if (error.response?.status === 403 && error.response?.data?.message?.includes("store")) {
      // Store access denied - redirect to store selection
      window.location.href = "/stores";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);