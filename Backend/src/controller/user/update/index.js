import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import bcrypt from "bcrypt";

// Update User
export const updateUser = async (req, res) => {
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


    const { fullname, email, password, role } = req.body;
    const updatedData = {};
    if (fullname !== undefined) updatedData.fullname = fullname;
    if (email !== undefined) updatedData.email = email;
    if (password !== undefined) updatedData.password = password;
    if (plan !== undefined) updatedData.plan = plan;

    if (Object.keys(updatedData).length === 0) {
      return ApiError(res, 400, "No valid fields provided for update");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
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
    console.error("Error in updateUser:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};


export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword === confirmPassword)
      return ApiError(res, 400, "Password Did not Match");
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return ApiError(res, 400, "Old Password Is Incorrect");
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    return ApiResponse(res, 200, "Password Changed Successfully");
  } catch (error) {
    console.error("Error in changePassword");
    return ApiResponse(res, 500, "Internal Server Error", error);
  }
};
