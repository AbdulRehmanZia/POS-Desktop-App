//  All Recent Activities Queries
import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const RecentActivity = async (req, res) => {
  try {
    const fifteenMinuteAgo = new Date(Date.now() - 15 * 60 * 1000);

    const storeId = req.store?.id || req.user?.storeId; 

    if (!storeId) {
      return ApiError(res, 400, null, "Store ID missing in request");
    }

    const [users, sales, categories] = await Promise.all([
      //User Recent Activity (scoped to store)
      prisma.user.findMany({
        where: {
          storeId,
          OR: [
            { createdAt: { gte: fifteenMinuteAgo } },
            { updatedAt: { gte: fifteenMinuteAgo } },
          ],
        },
        select: {
          fullname: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),

      // Sales Recent Activity (scoped to store)
      prisma.sale.findMany({
        where: {
          storeId,
          OR: [
            { createdAt: { gte: fifteenMinuteAgo } },
            { updatedAt: { gte: fifteenMinuteAgo } },
          ],
        },
        include: {
          saleItems: {
            select: {
              quantity: true,
              product: {
                select: {
                  name: true,
                  price: true,
                  stockQuantity: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      // Categories Recent Activity (scoped to store)
      prisma.category.findMany({
        where: {
          storeId,
          isDeleted: false,
          OR: [
            { createdAt: { gte: fifteenMinuteAgo } },
            { updatedAt: { gte: fifteenMinuteAgo } },
          ],
        },
        include: {
          products: true,
        },
      }),
    ]);

    const AllActivities = { users, sales, categories };
    return ApiResponse(res, 200, AllActivities, "All Activities fetched successfully");
  } catch (error) {
    console.error("RecentActivity error:", error);
    return ApiError(res, 500, error.message || "Fetching Error");
  }
};
