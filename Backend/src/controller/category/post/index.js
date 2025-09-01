import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Add Category
export const addCategory = async (req, res) => {
  try {
    const storeId = req.store.id;
    let { name } = req.body;

    if (!name) return ApiError(res, 400, null, "Name is required");

    name = name.trim().toLowerCase();

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    });

    if (!store) {
      return ApiError(res, 404, null, "Store not found");
    }

    const userPlan = store.owner.plan;

    const planLimits = {
      basic: 10,
      standard: 100,
      premium: Infinity, 
    };

    const categoryCount = await prisma.category.count({
      where: { storeId, isDeleted: false },
    });

    if (categoryCount >= planLimits[userPlan]) {
      return ApiError(
        res,
        403,
        null,
        `Category limit reached for your plan (${userPlan}). Upgrade to add more.`
      );
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        storeId,
      },
    });

    if (existingCategory) {
      if (!existingCategory.isDeleted) {
        return ApiError(res, 400, null, "This category already exists in this store");
      } else {
        const restoredCategory = await prisma.category.update({
          where: { id: existingCategory.id },
          data: { isDeleted: false },
        });
        return ApiResponse(res, 200, restoredCategory, "Category restored successfully");
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        storeId,
      },
    });

    return ApiResponse(res, 201, newCategory, "Category created successfully");
  } catch (error) {
    console.error("Error in addCategory:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};
