import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const getUsers = async (req, res) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const storeId = req.store.id;

  if (page < 1) page = 1;
  if (limit <= 0 || limit > 100) limit = 10;
  const skip = (page - 1) * limit;
console.log("Search query:", req.query.search);

  try {
    const whereClause = {
      isDeleted: false,
      memberOfStores: { some: { id: storeId } },
      OR: [
        { fullname: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    };

    const users = await prisma.user.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc", // Newest first
      },
    });

    const totalUsers = await prisma.user.count({ where: whereClause });
    const totalPages = Math.ceil(totalUsers / limit);

    return ApiResponse(
      res,
      200,
      users,
      "Users Fetched Successfully",
      {
        totalPages,
        currentPage: page,
        limit,
        totalUsers
      }
    );
  } catch (error) {
    console.error("Error in getUsers:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};
