import React, { useState, useEffect, useContext } from "react";
import { api } from "../Instance/api";
import { Trash2, Edit, Loader, AlertCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import toast from "react-hot-toast";
import { UserContext } from "../context/UserContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import CategoryForm from "./CategoryForm";
import ConfirmModal from "./ConfirmModal";

export default function CategoryTable({ refreshKey }) {
  const { user } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(
        `admin/categories?page=${pagination.page}&limit=${pagination.limit}`
      );
      setCategories(res.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.meta?.totalPages || 1,
        totalItems: res.data.meta?.totalItems || res.data.data.length
      }));
    } catch (error) {
      console.error("Error fetching categories", error);
      
      // Handle 404 specifically
      if (error.response?.status === 404) {
        setCategories([]);
        setPagination(prev => ({
          ...prev,
          totalPages: 1,
          totalItems: 0
        }));
        return;
      }
      
      // setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/categories/delete-category/${categoryToDelete}`);
      toast.success("Category deleted successfully");
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete));
      setPagination(prev => ({
        ...prev,
        totalItems: prev.totalItems - 1
      }));
      if (categories.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      }
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      // Force refresh after delete
      setTimeout(() => fetchCategories(), 100);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
      console.error("Error deleting category", error);
      fetchCategories();
      setDeleteModalOpen(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditSheetOpen(true);
  };

  const handleCategoryUpdated = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCategories();
    setIsEditSheetOpen(false);
    setSelectedCategory(null);
  };

  useEffect(() => {
    fetchCategories();
  }, [refreshKey, pagination.page, pagination.limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-10 w-10 text-[#1C3333]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#1C3333]">
        <AlertCircle className="h-12 w-12 mb-4 text-[#FF6F61]" />
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={fetchCategories}
          className="mt-4 px-4 cursor-pointer py-2 bg-[#1C3333] text-white rounded-md hover:bg-[#1C3333]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C3333]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#1C3333]/20 overflow-hidden">
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-[#F4F9F9]">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-[#1C3333]">
              {selectedCategory ? "Edit Category" : "New Category"}
            </SheetTitle>
          </SheetHeader>
          <CategoryForm
            initialData={selectedCategory}
            onCategoryAdded={handleCategoryUpdated}
            onClose={() => {
              setIsEditSheetOpen(false);
              setSelectedCategory(null);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Top pagination info and controls */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#1C3333]/20 bg-[#F4F9F9]">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[#1C3333]">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.totalItems)}
            </span>{" "}
            of <span className="font-medium">{pagination.totalItems}</span> results
          </span>
          <select
            value={pagination.limit}
            onChange={handleLimitChange}
            className="text-sm cursor-pointer border-[#1C3333]/30 rounded-md focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333]"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#1C3333]/20">
          <thead className="bg-[#F4F9F9]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                Products
              </th>
              {user?.role === "admin" && (
                <th className="px-6 py-3 text-right text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#1C3333]/20">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-[#F4F9F9]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#1C3333] capitalize">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap ">
                  <div className="text-sm text-[#1C3333]/80 text-center">{category._count?.products || 0}</div>
                </td>
                {user?.role === "admin" && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="text-[#1C3333] cursor-pointer hover:text-[#1C3333]/70 p-1 rounded-md hover:bg-[#1C3333]/10"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category.id)}
                        className="text-[#FF6F61] cursor-pointer hover:text-[#FF6F61]/80 p-1 rounded-md hover:bg-[#FF6F61]/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-10">
          <div className="bg-[#1C3333]/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="h-6 w-6 text-[#1C3333]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-[#1C3333]">No categories yet</h3>
          <p className="text-[#1C3333]/70 text-sm">Create your first category</p>
        </div>
      )}

      {/* Bottom pagination navigation */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 flex justify-center space-x-2 border-t border-[#1C3333]/20 bg-[#F4F9F9]">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 border cursor-pointer border-[#1C3333]/30 rounded-md text-sm font-medium text-[#1C3333] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1C3333]/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 text-sm text-[#1C3333] flex items-center">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 border cursor-pointer border-[#1C3333]/30 rounded-md text-sm font-medium text-[#1C3333] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1C3333]/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}