import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const updatePlan = async (req, res) => {
  try {
    const userId = Number(req.params.id); 
    const { plan } = req.body;

    if (!plan) {
      return ApiError(res, 400, "Plan is required");
    }

    const allowedPlans = ["basic", "standard", "premium"];
    if (!allowedPlans.includes(plan)) {
      return ApiError(res, 400, "Invalid plan type");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isDeleted) {
      return ApiError(res, 404, "User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: { id: true, email: true, plan: true },
    });

    return ApiResponse(res, 200, updatedUser, "Plan Updated Successfully");
  } catch (error) {
    console.error("Error in updatePlan:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};
