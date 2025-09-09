import { createContext, useEffect, useState } from "react";
import { api } from "../Instance/api";

export const UserContext = createContext(null);

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Auto-login check on app startup
  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedToken = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");
      
      if (savedToken && savedUser) {
        try {
          // Verify token is still valid by making a test API call
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          const response = await api.get("/api/v1/sales/"); 
          
          if (response.status === 200) {
            setUser(JSON.parse(savedUser));
            setAccessToken(savedToken);
          } else {
            throw new Error("Token invalid");
          }
        } catch (error) {
          console.log("Token expired or invalid, clearing storage");
          localStorage.clear();
          setUser(null);
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Keep storage in sync
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      localStorage.removeItem("accessToken");
      delete api.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  const logout = async () => {
    try {
      await api.post("/user/logout");
      setUser(null);
      setAccessToken(null);
      localStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['store-id'];
      
      // Trigger store context to clear its data
      window.dispatchEvent(new CustomEvent('user-logout'));
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post("/user/refresh-token");
      const { accessToken: newAccessToken } = response.data.data;
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.error("Token refresh failed", err);
      logout();
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C3333]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      accessToken, 
      setAccessToken, 
      logout, 
      refreshToken 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;