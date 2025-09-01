import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

//Delete User

export const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const storeId = req.store.id;

    const member = await prisma.user.findFirst({
      where: {
        id: userId,
        memberOfStores: { some: { id: storeId } },
        isDeleted: false
      },
    });

    if (!member) {
      return ApiError(res, 404, "User not found in this store");
    }

    // soft delete
    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });

    return ApiResponse(res, 200, null, "User Deleted Successfully");
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};

