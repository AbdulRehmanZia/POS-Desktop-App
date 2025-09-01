import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id; 
    const { name, price, costPrice, stockQuantity, unit, categoryId } = req.body;

    const productExist = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { store: true },
    });

    if (!productExist) {
      return ApiError(res, 404, null, "Product not found");
    }

    const store = await prisma.store.findFirst({
  where: {
    id: productExist.storeId,
    isDeleted: false,
    OownerId: req.user.id ,
    
  },
});

if (!store) {
  return ApiError(res, 403, "No access to this store");
}


    if (!store || store.ownerId !== userId) {
      return ApiError(res, 403, null, "No access to this store");
    }

    const updatedData = {};
    if (name !== undefined) updatedData.name = name.trim().toLowerCase();
    if (price !== undefined) updatedData.price = parseFloat(price);
    if (costPrice !== undefined) updatedData.costPrice = parseFloat(costPrice);
    if (stockQuantity !== undefined)
      updatedData.stockQuantity = parseInt(stockQuantity);
    if (unit !== undefined) updatedData.unit = unit;

    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });

      if (!category || category.storeId !== store.id) {
        return ApiError(res, 404, null, "Category not found in this store");
      }

      updatedData.category = { connect: { id: Number(categoryId) } };
    }

    if (Object.keys(updatedData).length === 0) {
      return ApiError(res, 400, null, "No valid fields provided for update.");
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(productId) },
      data: updatedData,
    });

    return ApiResponse(res, 200, updatedProduct, "Product updated successfully");
  } catch (error) {
    console.error("Update Error:", error);
    return ApiError(res, 500, error.message || "Internal Server Error");
  }
};
