import React, { useState, useEffect, useContext } from "react";
import { api } from "../Instance/api";
import { 
  Trash2, 
  Edit, 
  Loader, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X,
  Search
} from "lucide-react";
import toast from "react-hot-toast";
import { UserContext } from "../context/UserContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import ProductForm from "./ProductForm";
import ConfirmModal from "./ConfirmModal";

export default function ProductTable({ refreshKey, forceRefresh }) {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get("admin/categories");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minStock) params.append('minStock', minStock);
      if (maxStock) params.append('maxStock', maxStock);
      
      const res = await api.get(`admin/products?${params}`);
      setProducts(res.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.meta?.totalPages || 1,
        totalItems: res.data.meta?.totalItems || res.data.data.length
      }));
    } catch (error) {
      console.error("Error fetching products", error);
      setError("Failed to load products");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/products/delete-product/${productToDelete}`);
      toast.success("Product deleted successfully");
      
      if (forceRefresh) {
        forceRefresh();
      } else {

        setProducts(prev => prev.filter(prod => prod.id !== productToDelete));
        setPagination(prev => ({
          ...prev,
          totalItems: prev.totalItems - 1
        }));
        if (products.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        }
      }
      
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
      console.error("Error deleting product", error);
      fetchProducts();
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleMinStockChange = (e) => {
    setMinStock(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleMaxStockChange = (e) => {
    setMaxStock(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setMinPrice("");
    setMaxPrice("");
    setMinStock("");
    setMaxStock("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = () => {
    return searchTerm || categoryFilter || minPrice || maxPrice || minStock || maxStock;
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditSheetOpen(true);
  };

  const handleProductUpdated = () => {
  // reset to page 1
  setPagination(prev => ({ ...prev, page: 1 }));

  // directly refresh products in THIS table
  fetchProducts();

  // close sheet
  setIsEditSheetOpen(false);
  setSelectedProduct(null);
};

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    refreshKey, 
    pagination.page, 
    pagination.limit, 
    searchTerm, 
    categoryFilter,
    minPrice,
    maxPrice,
    minStock,
    maxStock
  ]);

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
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-[#1C3333] text-white rounded-md hover:bg-[#1C3333]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C3333]"
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
              {selectedProduct ? "Edit Product" : "New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductForm
            initialData={selectedProduct}
            onProductAdded={handleProductUpdated}
            onClose={() => {
              setIsEditSheetOpen(false);
              setSelectedProduct(null);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Top controls with search and filters */}
      <div className="px-4 py-3 border-b border-[#1C3333]/20 bg-[#F4F9F9]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1C3333]/70" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-[#1C3333]/70 hover:text-[#1C3333]"
                >
                  <X className="h-4 w-4 mr-" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="px-3 py-2 border cursor-pointer border-[#1C3333]/30 rounded-md text-sm font-medium text-[#1C3333] hover:bg-[#1C3333]/10 flex items-center gap-2"
              >
                <Filter className="h-4 w-4 cursor-pointer" />
                Filters
                {hasActiveFilters() && (
                  <span className="bg-[#FF6F61] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
              
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 border border-[#1C3333]/30 rounded-md text-sm font-medium text-[#1C3333] hover:bg-[#1C3333]/10 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {filtersVisible && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#1C3333]/10">
              <div>
                <label className="block text-sm font-medium text-[#1C3333] mb-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    className="w-full cursor-pointer px-3 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categoryFilter && (
                    <button
                      onClick={() => setCategoryFilter("")}
                      className="absolute right-8 cursor-pointer top-1/2 transform -translate-y-1/2 text-[#1C3333]/70 hover:text-[#1C3333]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1C3333] mb-1">
                  Min Price
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    className="w-full pl-3 pr-10 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white"
                  />
                  {minPrice && (
                    <button
                      onClick={() => setMinPrice("")}
                      className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 text-[#1C3333]/70 hover:text-[#1C3333]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1C3333] mb-1">
                  Max Price
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Max price"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    className="w-full pl-3 pr-10 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white"
                  />
                  {maxPrice && (
                    <button
                      onClick={() => setMaxPrice("")}
                      className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 text-[#1C3333]/70 hover:text-[#1C3333]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1C3333] mb-1">
                  Stock Range
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minStock}
                      onChange={handleMinStockChange}
                      className="w-full pl-3 pr-8 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white"
                    />
                    {minStock && (
                      <button
                        onClick={() => setMinStock("")}
                        className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 text-[#1C3333]/70 hover:text-[#1C3333]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <span className="self-center text-[#1C3333]/70">-</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxStock}
                      onChange={handleMaxStockChange}
                      className="w-full pl-3 pr-8 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white"
                    />
                    {maxStock && (
                      <button
                        onClick={() => setMaxStock("")}
                        className="absolute right-2 cursor-pointer top-1/2 transform -translate-y-1/2 text-[#1C3333]/70 hover:text-[#1C3333]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
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
            className="text-sm cursor-pointer border-[#1C3333]/30 rounded-md focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] py-1 px-2"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                Cost Price
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                Stock
              </th>
              {user?.role === "admin" && (
                <th className="px-6 py-3 text-right text-xs font-medium text-[#1C3333] uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#1C3333]/20">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#F4F9F9]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#1C3333] capitalize">{product.name}</div>
                  <div className="text-sm text-[#1C3333]/80">{product.unit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#1C3333]">{product.category?.name || "N/A"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-[#1C3333]">Rs.{product.price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-[#1C3333]">Rs.{product.costPrice.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={`text-sm font-medium ${
                    product.stockQuantity <= 5 ? "text-[#FF6F61]" : "text-[#1C3333]"
                  }`}>
                    {product.stockQuantity}
                  </div>
                </td>
                {user?.role === "admin" && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-[#1C3333] cursor-pointer hover:text-[#1C3333]/70 p-1 rounded-md hover:bg-[#1C3333]/10"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
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

      {products.length === 0 && !loading && (
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-[#1C3333]">
            {hasActiveFilters() ? "No products match your filters" : "No products yet"}
          </h3>
          <p className="text-[#1C3333]/70 text-sm">
            {hasActiveFilters() ? "Try adjusting your filters" : "Create your first product"}
          </p>
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="mt-2 cursor-pointer px-4 py-1 text-sm bg-[#1C3333] text-white rounded-md hover:bg-[#1C3333]/90"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Bottom pagination navigation */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-3 flex justify-center space-x-2 border-t border-[#1C3333]/20 bg-[#F4F9F9]">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 border border-[#1C3333]/30 rounded-md text-sm font-medium text-[#1C3333] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1C3333]/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 text-sm text-[#1C3333] flex items-center">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 border border-[#1C3333]/30 rounded-md text-sm font-medium text-[#1C3333] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1C3333]/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}