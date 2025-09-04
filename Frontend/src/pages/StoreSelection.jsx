import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Store, 
  Plus, 
  Crown, 
  Users, 
  Trash2, 
  Edit, 
  Loader, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  X
} from "lucide-react";
import { StoreContext } from "../context/StoreContext";
import { UserContext } from "../context/UserContext";
import { api } from "../Instance/api";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";

export default function StoreSelection() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { 
    userStores, 
    currentStore, 
    switchStore, 
    fetchUserStores, 
    isLoadingStores 
  } = useContext(StoreContext);
  
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    fetchUserStores();
  }, []);

  const handleStoreSelect = (store) => {
    switchStore(store);
    toast.success(`Switched to ${store.name}`);
    navigate("/dashboard");
  };

  const handleCreateNew = () => {
    setEditingStore(null);
    setStoreName("");
    setIsSheetOpen(true);
  };

  const handleEditStore = (store, e) => {
    e.stopPropagation();
    if (store.ownerId !== user.id) {
      toast.error("Only store owners can edit stores");
      return;
    }
    setEditingStore(store);
    setStoreName(store.name);
    setIsSheetOpen(true);
  };

  const handleSaveStore = async () => {
    if (!storeName.trim()) {
      toast.error("Store name is required");
      return;
    }

    setLoading(true);
    try {
      if (editingStore) {
        // Update existing store
        await api.put(`/stores/update/${editingStore.id}`, { name: storeName.trim() });
        toast.success("Store updated successfully");
      } else {
        // Create new store
        await api.post("/stores/create", { name: storeName.trim() });
        toast.success("Store created successfully");
      }
      
      // Refresh stores list
      await fetchUserStores();
      setIsSheetOpen(false);
      setEditingStore(null);
      setStoreName("");
    } catch (error) {
      toast.error(error.response?.data?.message || 
        (editingStore ? "Failed to update store" : "Failed to create store"));
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (store) => {
    return store.ownerId === user.id ? "Owner" : "Member";
  };

  const handleDeleteClick = (store, e) => {
    e.stopPropagation();
    if (store.ownerId !== user.id) {
      toast.error("Only store owners can delete stores");
      return;
    }
    setStoreToDelete(store);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    
    setLoading(true);
    try {
      await api.put(`/stores/delete/${storeToDelete.id}`);
      toast.success("Store deleted successfully");
      
      // If deleted store was current store, clear current store
      if (currentStore?.id === storeToDelete.id) {
        switchStore(null);
      }
      
      // Refresh stores list
      await fetchUserStores();
      setDeleteModalOpen(false);
      setStoreToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete store");
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = userStores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingStores) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-10 w-10 text-[#1C3333]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F9F9] p-6">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-[#F4F9F9]">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-[#1C3333]">
              {editingStore ? "Edit Store" : "Create New Store"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#1C3333]">
                Store Name
              </label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Enter store name"
                className="w-full px-3 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white cursor-pointer"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsSheetOpen(false);
                  setEditingStore(null);
                  setStoreName("");
                }}
                className="px-4 py-2 border border-[#1C3333]/30 rounded-md shadow-sm text-sm font-medium text-[#1C3333] bg-white hover:bg-[#F4F9F9] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStore}
                disabled={loading || !storeName.trim()}
                className="px-4 py-2 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1C3333] hover:bg-[#1C3333]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C3333] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2 h-4 w-4 inline" />
                    {editingStore ? "Updating..." : "Creating..."}
                  </>
                ) : editingStore ? (
                  "Update Store"
                ) : (
                  "Create Store"
                )}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="bg-white rounded-lg border border-[#1C3333]/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1C3333]/20 bg-[#F4F9F9]">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1C3333]/70" />
              <input
                type="text"
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-[#1C3333]/70 hover:text-[#1C3333]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Create Store Button - Only for Admin */}
            {user?.role === "admin" && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2 bg-[#1C3333] text-white rounded-md hover:bg-[#1C3333]/90 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create Store
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#1C3333]/20">
            <thead className="bg-[#F4F9F9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                  Store Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                  Status
                </th>
                {/* Actions column - Only show for admin */}
                {user?.role === "admin" && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#1C3333]/20">
              {filteredStores.map((store) => (
                <tr 
                  key={store.id} 
                  className="hover:bg-[#F4F9F9] cursor-pointer"
                  onClick={() => handleStoreSelect(store)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1C3333] rounded-full flex items-center justify-center">
                        <Store className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1C3333] capitalize">{store.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-[#1C3333]">
                      {getUserRole(store) === "Owner" ? (
                        <>
                          <Crown className="h-4 w-4" />
                          Owner
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          Member
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-[#1C3333]">{store.members?.length || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {currentStore?.id === store.id ? (
                      <span className="px-2 py-1 text-xs bg-[#1C3333] text-white rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        Inactive
                      </span>
                    )}
                  </td>
                  {/* Actions column - Only show for admin */}
                  {user?.role === "admin" && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {getUserRole(store) === "Owner" && (
                          <>
                            <button
                              onClick={(e) => handleEditStore(store, e)}
                              className="text-[#1C3333] cursor-pointer hover:text-[#1C3333]/70 p-1 rounded-md hover:bg-[#1C3333]/10"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(store, e)}
                              disabled={loading}
                              className="text-[#FF6F61] cursor-pointer hover:text-[#FF6F61]/80 p-1 rounded-md hover:bg-[#FF6F61]/10"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-10">
            <div className="bg-[#1C3333]/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
              <Store className="h-6 w-6 text-[#1C3333]" />
            </div>
            <h3 className="text-base font-medium text-[#1C3333]">
              {searchTerm ? "No stores match your search" : "You don't have any stores yet"}
            </h3>
            <p className="text-[#1C3333]/70 text-sm">
              {searchTerm ? "Try a different search term" : "Create your first store to get started"}
            </p>
            {user?.role === "admin" && !searchTerm && (
              <button
                onClick={handleCreateNew}
                className="mt-2 cursor-pointer px-4 py-3 text-sm bg-[#1C3333] text-white rounded-md hover:bg-[#1C3333]/90"
              >
                Create Your First Store
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Store"
        message={`Are you sure you want to delete "${storeToDelete?.name}"? This action cannot be undone and will permanently delete all store data.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setStoreToDelete(null);
        }}
        loading={loading}
      />
    </div>
  );
}