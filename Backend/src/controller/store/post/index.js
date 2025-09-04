import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const createStore = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return ApiError(res, 400, "Store name is required");
    }
// Checking Plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, plan: true }
    });

    if (!user) {
      return ApiError(res, 404, "User not found");
    }

    const planLimits = {
      basic: 1,      
      standard: 3,    
      premium: 10, 
    };

    const storeCount = await prisma.store.count({
      where: { ownerId: userId }
    });

    if (storeCount >= planLimits[user.plan]) {
      return ApiError(
        res,
        403,
        `Store limit reached for your plan (${user.plan}). Upgrade to add more.`
      );
    }

    // Create store

    const store = await prisma.store.create({
      data: {
        name,
        ownerId: userId,
        members: {
          connect: { id: userId }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            fullname: true,
            email: true
          }
        }
      }
    });

    return ApiResponse(res, 201, store, "Store created successfully");
  } catch (error) {
    console.error("Error in createStore:", error);
    return ApiError(res, 500, "Internal Server Error");
  }
};