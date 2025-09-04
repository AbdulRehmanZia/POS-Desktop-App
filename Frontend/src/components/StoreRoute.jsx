import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import { UserContext } from "../context/UserContext";

const StoreRoute = ({ children }) => {
  const {
    currentStore,
    userStores,
    hasStores,
    isLoadingStores,
    fetchUserStores,
  } = useContext(StoreContext);

  const { user } = useContext(UserContext);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    if (userStores.length === 0 && !hasAttemptedFetch) {
      setHasAttemptedFetch(true);
      fetchUserStores();
    }
  }, [userStores.length, fetchUserStores, hasAttemptedFetch]);

  if (isLoadingStores || (userStores.length === 0 && hasAttemptedFetch)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C3333]">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          Loading stores...
        </div>
      </div>
    );
  }

  if (!hasStores && !isLoadingStores) {
    if (user.role === "cashier") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#1C3333]">
          <div className="text-center text-white">
            <div className="mb-4">
              <h2 className="text-xl font-bold">No Store Access</h2>
              <p className="text-gray-300">
                You don't have access to any stores. Please contact your administrator.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (user.role === "admin") {
      return <Navigate to="/create-store" replace />;
    }

    
  }

  // Wait for currentStore to be set automatically by StoreContext
  if (hasStores && !currentStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C3333]">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          Setting up store...
        </div>
      </div>
    );
  }

  return children;
};

export default StoreRoute;