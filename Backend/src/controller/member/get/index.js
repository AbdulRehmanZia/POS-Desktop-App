import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Get All Members
export const getAllStoreMembers = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    if (page < 1) page = 1;
    if (limit <= 0 || limit > 100) limit = 10;
    const skip = (page - 1) * limit;

    const storeId = req.store.id;

    const allMembers = await prisma.user.findMany({
      where: {
        isDeleted: false,
        memberOfStores: { some: { id: storeId } } 
      },
      select: { id: true, fullname: true, email: true, role: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalMembers = await prisma.user.count({
      where: {
        isDeleted: false,
        memberOfStores: { some: { id: storeId } }
      },
    });

    const totalPages = Math.ceil(totalMembers / limit);

    return ApiResponse(res, 200, allMembers, "Store Members Fetched Successfully", {
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    console.log("Error in getAllStoreMembers:", error);
    return ApiError(res, 500, "Internal Server Error");
  }
};



