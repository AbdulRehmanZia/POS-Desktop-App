import React, { useState, useEffect } from "react";
import { api } from "../Instance/api";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

export default function ProductForm({ onProductAdded, initialData, onClose }) {
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [costPrice, setCostPrice] = useState(initialData?.costPrice || "");
  const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity || "");
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/admin/categories");
        setCategories(res.data.data);
      } catch (error) {
        console.error("Error fetching categories", error);
        // toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        name: name.trim(),
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
        stockQuantity: parseInt(stockQuantity),
        unit: unit.trim(),
        categoryId: parseInt(categoryId)
      };

      if (initialData) {
        await api.put(`/admin/products/update-product/${initialData.id}`, productData);
        toast.success("Product updated successfully!");
      } else {
        const response = await api.post("/admin/products/add-product", productData);
        toast.success("Product added successfully!");
        if (onProductAdded) onProductAdded(response.data);
      }
      if (onClose) onClose();
      if (!initialData) {
        setName("");
        setPrice("");
        setCostPrice("");
        setStockQuantity("");
        setUnit("");
        setCategoryId("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#1C3333]">
          Product Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          className="w-full px-3 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white cursor-pointer"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#1C3333]">
            Price
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="w-full px-3 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white cursor-pointer"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#1C3333]">
            Cost Price
          </label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="Enter cost price"
            className="w-full px-3 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white cursor-pointer"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#1C3333]">
            Stock Quantity
          </label>
          <input
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="Enter stock quantity"
            className="w-full px-3 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white cursor-pointer"
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#1C3333]">
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-3 py-2 border border-[#1C3333]/30 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-[#1C3333] 
                       focus:border-[#1C3333] text-[#1C3333] bg-white cursor-pointer"
            required
          >
            <option value="">Select unit</option>
            <option value="piece">Piece</option>
            <option value="kg">Kilogram (kg)</option>
            <option value="g">Gram (g)</option>
            <option value="lb">Pound (lb)</option>
            <option value="oz">Ounce (oz)</option>
            <option value="ltr">Liter (ltr)</option>
            <option value="ml">Milliliter (ml)</option>
            <option value="pack">Pack</option>
            <option value="box">Box</option>
            <option value="dozen">Dozen</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#1C3333]">
          Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 border border-[#1C3333]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1C3333] focus:border-[#1C3333] text-[#1C3333] bg-white cursor-pointer"
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#1C3333]/30 rounded-md shadow-sm text-sm font-medium text-[#1C3333] bg-white hover:bg-[#F4F9F9] cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1C3333] hover:bg-[#1C3333]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1C3333] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="animate-spin mr-2 h-4 w-4 inline" />
              {initialData ? "Updating..." : "Creating..."}
            </>
          ) : initialData ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </button>
      </div>
    </form>
  );
}