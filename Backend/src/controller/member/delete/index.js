import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Delete Store Member
export const deleteStoreMember = async (req, res) => {
  try {
    const memberId = Number(req.params.id);
    const storeId = req.store.id;

    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        isDeleted: false,
        memberOfStores: { some: { id: storeId } }
      },
    });

    if (!member) {
      return ApiError(res, 404, null, "Member not found in this store");
    }

    await prisma.user.update({
      where: { id: memberId },
      data: { isDeleted: true },
    });

    return ApiResponse(res, 200, null, "Member Deleted Successfully");
  } catch (error) {
    console.error("Error in deleteStoreMember:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};
