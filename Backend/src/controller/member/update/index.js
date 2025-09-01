import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

//update Store Member
export const updateStoreMember = async (req, res) => {
  try {
    const memberId = Number(req.params.id);
    const storeId = req.store.id;
    const { fullname, email } = req.body;

    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        isDeleted: false,
        memberOfStores: { some: { id: storeId } }
      },
    });

    if (!member) {
      return ApiError(res, 404, "Member not found in this store");
    }

    const updatedData = {};
    if (fullname !== undefined) updatedData.fullname = fullname;
    if (email !== undefined) updatedData.email = email;

    if (Object.keys(updatedData).length === 0) {
      return ApiError(res, 400, "No valid fields provided for update");
    }

    const updatedUser = await prisma.user.update({
      where: { id: memberId },
      data: updatedData,
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
      },
    });

    return ApiResponse(res, 200, updatedUser, "User Updated Successfully");
  } catch (error) {
    console.error("Error in updateStoreMember:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};