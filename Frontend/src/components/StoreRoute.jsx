import React, { useContext, useEffect } from "react";
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

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    // Always fetch stores when component mounts for both cashier and other roles
    // This ensures we have store data and can set the store-id header
    if (userStores.length === 0) {
      fetchUserStores();
    }
  }, [userStores.length, fetchUserStores]);

  // Show loading while fetching stores
  if (isLoadingStores) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C3333]">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          Loading stores...
        </div>
      </div>
    );
  }

  // If user has no stores
  if (!hasStores) {
    // Cashiers can't create stores, so show error message
    if (user.role === "cashier") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#1C3333]">
          <div className="text-center text-white">
            <div className="mb-4">
              <h2 className="text-xl font-bold">No Store Access</h2>
              <p className="text-gray-300">You don't have access to any stores. Please contact your administrator.</p>
            </div>
          </div>
        </div>
      );
    }
    // Only admins can create stores when they have no stores
    return <Navigate to="/create-store" replace />;
  }

  // Wait for currentStore to be set automatically by StoreContext
  // The StoreContext will automatically set the first store when stores are loaded
  if (!currentStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C3333]">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          Setting up store...
        </div>
      </div>
    );
  }

  // All checks passed, render the protected component
  return children;
};

export default StoreRoute;