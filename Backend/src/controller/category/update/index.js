import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) return ApiError(res, 400, "Name is required");

    const categoryExist = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExist || categoryExist.isDeleted) {
      return ApiError(res, 404, null, "Category not found");
    }

    const store = await prisma.store.findFirst({
  where: {
    id: categoryExist.storeId,
    isDeleted: false,
     ownerId: req.user.id ,
    
  },
});

if (!store) {
  return ApiError(res, 403, "No access to this store");
}


    if (!store || store.ownerId !== userId) {
      return ApiError(res, 403, null, "No access to this store");
    }

    const normalizedName = name.trim().toLowerCase();

    // Check duplicate in this store only
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: normalizedName,
        storeId: categoryExist.storeId,
        NOT: { id: categoryId },
      },
    });

    if (existingCategory) {
      return ApiError(res, 400, "This category already exists in this store");
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name: normalizedName },
    });

    return ApiResponse(
      res,
      200,
      updatedCategory,
      "Category updated successfully"
    );
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};
