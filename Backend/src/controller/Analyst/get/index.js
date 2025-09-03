import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import moment from "moment";

// All Analyst Query (store-bound)
export const allAnalyst = async (req, res) => {
  try {
    const storeId = req.store?.id;
    if (!storeId) {
      return ApiError(res, 400, null, "Store ID missing in request");
    }

    // Total Members (store-bound)
    const totalMembers = await prisma.user.count({
      where: {
        isDeleted: false,
        OR: [
          { memberOfStores: { some: { id: storeId } } },
          { ownedStores: { some: { id: storeId } } },
        ],
      },
    });

    // Total Products
    const totalProducts = await prisma.product.count({
      where: { storeId, isDeleted: false },
    });

    // Total Sale Items
    const totalSaleItems = await prisma.saleItem.count({
      where: { sale: { storeId } },
    });

    // Total Sales Amount
    const totalSalesAmount = await prisma.sale.aggregate({
      where: { storeId },
      _sum: { totalAmount: true },
    });

    // Category-wise Product Count
    const categoryWiseProductCount = await prisma.category.findMany({
      where: { storeId, isDeleted: false },
      select: {
        id: true,
        name: true,
        _count: { select: { products: true } },
      },
    });

    // Grouped Sales by Day
    const groupedSales = await prisma.sale.groupBy({
      by: ["createdAt"],
      where: { storeId },
      _sum: { totalAmount: true },
      orderBy: { createdAt: "asc" },
    });

    const dailySales = groupedSales.reduce((acc, item) => {
      const dateOnly = moment(item.createdAt).format("DD-MM-YYYY");
      if (!acc[dateOnly]) acc[dateOnly] = 0;
      acc[dateOnly] += item._sum.totalAmount || 0;
      return acc;
    }, {});

    const summary = {
      totalMembers,
      totalProducts,
      totalSaleItems,
      totalSalesAmount: totalSalesAmount._sum.totalAmount || 0,
      dailySales,
      categoryWiseProductCount,
    };

    return ApiResponse(res, 200, summary, "Summary Fetched Successfully");
  } catch (error) {
    console.error("AllAnalyst error:", error);
    return ApiError(res, 500, error.message || "Internal Server Error", "Fetching Error");
  }
};
