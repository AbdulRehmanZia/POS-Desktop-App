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

  // Simple auth state initialization - no API calls needed
  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        // Trust the saved data - let axios interceptor handle token validation
        setUser(JSON.parse(savedUser));
        setAccessToken(savedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Keep storage in sync
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
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

  // Listen for logout events from axios interceptor
  useEffect(() => {
    const handleInterceptorLogout = () => {
      setUser(null);
      setAccessToken(null);
    };

    // Listen for logout events triggered by axios interceptor
    window.addEventListener('auth-logout', handleInterceptorLogout);
    
    return () => {
      window.removeEventListener('auth-logout', handleInterceptorLogout);
    };
  }, []);

  const logout = async () => {
    try {
      await api.post("/user/logout");
    } catch (err) {
      console.error("Logout API call failed", err);
      // Continue with logout even if API call fails
    } finally {
      // Always clear local state regardless of API call result
      setUser(null);
      setAccessToken(null);
      localStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['store-id'];
      
      // Trigger store context to clear its data
      window.dispatchEvent(new CustomEvent('user-logout'));
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