import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import moment from "moment"; 

//   All Analyst Query
export const AllAnalyst = async (req, res) => {
  try {
    const storeId = req.store?.id || req.user?.storeId;

    if (!storeId) {
      return ApiError(res, 400, null, "Store ID missing in request");
    }

    // Members
    const totalMembers = await prisma.user.count({
      where: { storeId },
    });

    // Products
    const totalProducts = await prisma.product.count({
      where: { storeId },
    });

    // Sale Items
    const totalSaleItems = await prisma.saleItem.count({
      where: {
        sale: { storeId },
      },
    });

    // Sales Amount
    const totalSalesAmount = await prisma.sale.aggregate({
      where: { storeId },
      _sum: { totalAmount: true },
    });

    // Category-wise Product Count
    const categoryWiseProductCount = await prisma.category.findMany({
      where: {
        storeId,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { products: true },
        },
      },
    });

    // Daily Sales Grouped
    const groupedSales = await prisma.sale.groupBy({
      by: ["createdAt"],
      where: { storeId },
      _sum: { totalAmount: true },
      orderBy: { createdAt: "asc" },
    });

    const dailySales = groupedSales.reduce((acc, item) => {
      const dateOnly = moment(item.createdAt).format("DD-MM-YYYY");
      if (!acc[dateOnly]) {
        acc[dateOnly] = 0;
      }
      acc[dateOnly] += item._sum.totalAmount || 0;
      return acc;
    }, {});

    const Summary = {
      totalMembers,
      totalProducts,
      totalSaleItems,
      totalSalesAmount: totalSalesAmount._sum.totalAmount || 0,
      dailySales,
      categoryWiseProductCount,
    };

    return ApiResponse(res, 200, Summary, "Summary Fetched Successfully");
  } catch (error) {
    console.error("AllAnalyst error:", error);
    return ApiError(res, 500, error.message || "Fetching Error");
  }
};
