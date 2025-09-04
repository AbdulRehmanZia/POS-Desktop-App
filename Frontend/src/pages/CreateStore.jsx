import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, ArrowRight, Loader } from "lucide-react";
import { api } from "../Instance/api";
import { StoreContext } from "../context/StoreContext";
import toast from "react-hot-toast";

export default function CreateStore() {
  const navigate = useNavigate();
  const { fetchUserStores, switchStore } = useContext(StoreContext);
  const [formData, setFormData] = useState({
    name: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/stores/create", formData);
      const newStore = response.data.data;

      toast.success("Store created successfully!");
      
      // Refresh user stores and switch to the new store
      await fetchUserStores();
      switchStore(newStore);
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Create store error:", error);
      const errMsg = error.response?.data?.message || "Failed to create store. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C3333] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden border border-[#1C3333]/20"
      >
        <div className="bg-white p-8 text-center border-b border-[#1C3333]/20">
          <div className="mx-auto w-16 h-16 bg-[#1C3333] rounded-full flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1C3333]">Create Your Store</h1>
          <p className="mt-2 text-[#1C3333]/80">Set up your business to get started</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-[#1C3333]">
                Store Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your store name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2.5 border border-[#1C3333]/30 rounded-md focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] transition text-[#1C3333] bg-white"
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`w-full py-3 px-4 cursor-pointer rounded-md font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                isLoading
                  ? "bg-[#1C3333]/80 cursor-not-allowed"
                  : "bg-[#1C3333] hover:bg-[#1C3333]/90 shadow-sm"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" />
                  Creating Store...
                </>
              ) : (
                <>
                  Create Store
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/stores")}
              className="text-sm text-[#1C3333] cursor-pointer hover:text-[#1C3333]/70 hover:underline"
            >
              Already have stores? View all stores
            </button>
          </div> */}
        </div>
      </motion.div>
    </div>
  );
}