import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Delete User (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return ApiError(res, 400, "Invalid user ID");
    }

    const result = await prisma.user.updateMany({
      where: { id: userId, isDeleted: false },
      data: { isDeleted: true },
    });

    if (result.count === 0) {
      return ApiError(res, 404, "User not found or already deleted");
    }

    return ApiResponse(res, 200, null, "User deleted successfully");
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};
