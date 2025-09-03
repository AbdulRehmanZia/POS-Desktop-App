import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const recentActivity = async (req, res) => {
  try {
    const storeId = req.store?.id;
    if (!storeId) {
      return ApiError(res, 400, null, "Store ID missing in request");
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const [users, sales, categories] = await Promise.all([
      // Recent Users
      prisma.user.findMany({
        where: {
          isDeleted: false,
          AND: [
            {
              OR: [
                { memberOfStores: { some: { id: storeId } } },
                { ownedStores: { some: { id: storeId } } },
              ],
            },
            {
              OR: [
                { createdAt: { gte: fifteenMinutesAgo } },
                { updatedAt: { gte: fifteenMinutesAgo } },
              ],
            },
          ],
        },
        select: {
          fullname: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Recent Sales
      prisma.sale.findMany({
        where: {
          storeId,
          isDeleted: false,
          OR: [
            { createdAt: { gte: fifteenMinutesAgo } },
            { updatedAt: { gte: fifteenMinutesAgo } },
          ],
        },
        include: {
          saleItems: {
            select: {
              quantity: true,
              product: { select: { name: true, price: true, stockQuantity: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Recent Categories
      prisma.category.findMany({
        where: {
          storeId,
          isDeleted: false,
          OR: [
            { createdAt: { gte: fifteenMinutesAgo } },
            { updatedAt: { gte: fifteenMinutesAgo } },
          ],
        },
        include: { products: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const allActivities = { users, sales, categories };
    return ApiResponse(res, 200, allActivities, "All Activities fetched successfully");
  } catch (error) {
    console.error("RecentActivity error:", error);
    return ApiError(res, 500, error.message || "Internal Server Error", "Fetching Error");
  }
};
