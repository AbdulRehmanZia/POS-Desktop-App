import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Delete Product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const productExist = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!productExist) {
      return ApiError(res, 404, null, "Product not found");
    }

    // Verify ownership of the store
    const store = await prisma.store.findFirst({
      where: {
        id: productExist.storeId,
        isDeleted: false,
        ownerId: userId,
      },
    });

    if (!store) {
      return ApiError(res, 403, null, "No access to this store");
    }

    // Soft delete product
    await prisma.product.update({
      where: { id: Number(productId) },
      data: { isDeleted: true },
    });

    return ApiResponse(res, 200, null, "Product successfully deleted (soft)");
  } catch (error) {
    console.error("Product Delete Error:", error);
    return ApiError(res, 500, error.message || "Internal Server Error");
  }
};
