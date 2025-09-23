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

// Helper function to check if request is for authentication endpoints
const isAuthRequest = (url) => {
  const authEndpoints = [
    'user/login', '/user/login', 
    'user/refresh-token', '/user/refresh-token', 
    'user/register', '/user/register', 
    'user/forgot-password', '/user/forgot-password', 
    'user/reset-password', '/user/reset-password'
  ];
  return authEndpoints.some(endpoint => url?.includes(endpoint));
};

api.interceptors.request.use((config) => {
  // Don't add auth headers for auth requests
  if (!isAuthRequest(config.url)) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Add store-id header for store-specific requests
  if (!isAuthRequest(config.url)) {
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
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url;
    
    // Never intercept auth endpoint errors - let them pass through to components
    if (isAuthRequest(url)) {
      return Promise.reject(error);
    }

    // Only handle 401s for non-auth endpoints
    if (status === 401 && !originalRequest._retry) {
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
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Clear all storage on refresh token failure
        localStorage.clear();
        delete api.defaults.headers.common["Authorization"];
        delete api.defaults.headers.common["store-id"];
        
        // Trigger context to update state
        window.dispatchEvent(new CustomEvent('auth-logout'));
        
        // Only redirect if we're not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle store access errors
    if (status === 403 && error.response?.data?.message?.includes("store")) {
      window.location.href = "/stores";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);