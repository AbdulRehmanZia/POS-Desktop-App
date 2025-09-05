import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import moment from "moment";

// All Analyst Query 
export const allAnalyst = async (req, res) => {
  try {
    const storeId = req.store?.id;
    const { range = '30days' } = req.query; // Get range from query params
    
    if (!storeId) {
      return ApiError(res, 400, null, "Store ID missing in request");
    }

    // Get current date and calculate date ranges
    const now = moment();
    const todayStart = now.clone().startOf('day');
    const todayEnd = now.clone().endOf('day');
    const lastWeekStart = now.clone().subtract(1, 'weeks').startOf('week');
    const lastWeekEnd = now.clone().subtract(1, 'weeks').endOf('week');
    const lastMonthStart = now.clone().subtract(1, 'months').startOf('month');
    const lastMonthEnd = now.clone().subtract(1, 'months').endOf('month');
    const lastSixMonthsStart = now.clone().subtract(6, 'months').startOf('month');
    const lastYearStart = now.clone().subtract(1, 'years').startOf('year');
    const lastYearEnd = now.clone().subtract(1, 'years').endOf('year');
    const allTimeStart = moment("2000-01-01"); // Arbitrary early date

    // Calculate start date based on range parameter
    let chartStartDate;
    switch (range) {
      case '7days':
        chartStartDate = now.clone().subtract(7, 'days').startOf('day');
        break;
      case '30days':
        chartStartDate = now.clone().subtract(30, 'days').startOf('day');
        break;
      case '90days':
        chartStartDate = now.clone().subtract(90, 'days').startOf('day');
        break;
      case '6months':
        chartStartDate = now.clone().subtract(6, 'months').startOf('month');
        break;
      case '12months':
        chartStartDate = now.clone().subtract(12, 'months').startOf('month');
        break;
      case 'all':
      default:
        chartStartDate = moment("2000-01-01"); // Arbitrary early date
    }

    // Total Members 
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

    // Time-based sales aggregations
    const todaySales = await prisma.sale.aggregate({
      where: { 
        storeId,
        createdAt: {
          gte: todayStart.toDate(),
          lte: todayEnd.toDate()
        }
      },
      _sum: { totalAmount: true },
    });

    const lastWeekSales = await prisma.sale.aggregate({
      where: { 
        storeId,
        createdAt: {
          gte: lastWeekStart.toDate(),
          lte: lastWeekEnd.toDate()
        }
      },
      _sum: { totalAmount: true },
    });

    const lastMonthSales = await prisma.sale.aggregate({
      where: { 
        storeId,
        createdAt: {
          gte: lastMonthStart.toDate(),
          lte: lastMonthEnd.toDate()
        }
      },
      _sum: { totalAmount: true },
    });

    const lastSixMonthsSales = await prisma.sale.aggregate({
      where: { 
        storeId,
        createdAt: {
          gte: lastSixMonthsStart.toDate(),
          lte: now.toDate()
        }
      },
      _sum: { totalAmount: true },
    });

    const lastYearSales = await prisma.sale.aggregate({
      where: { 
        storeId,
        createdAt: {
          gte: lastYearStart.toDate(),
          lte: lastYearEnd.toDate()
        }
      },
      _sum: { totalAmount: true },
    });

    const allTimeSales = await prisma.sale.aggregate({
      where: { 
        storeId,
        createdAt: {
          gte: allTimeStart.toDate(),
          lte: now.toDate()
        }
      },
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

    // Grouped Sales by Day (based on selected range)
    const groupedSales = await prisma.sale.groupBy({
      by: ["createdAt"],
      where: { 
        storeId,
        createdAt: {
          gte: chartStartDate.toDate(),
          lte: now.toDate()
        }
      },
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
      timeBasedSales: {
        today: todaySales._sum.totalAmount || 0,
        lastWeek: lastWeekSales._sum.totalAmount || 0,
        lastMonth: lastMonthSales._sum.totalAmount || 0,
        lastSixMonths: lastSixMonthsSales._sum.totalAmount || 0,
        lastYear: lastYearSales._sum.totalAmount || 0,
        allTime: allTimeSales._sum.totalAmount || 0,
      },
      dailySales,
      categoryWiseProductCount,
    };

    return ApiResponse(res, 200, summary, "Summary Fetched Successfully");
  } catch (error) {
    console.error("AllAnalyst error:", error);
    return ApiError(res, 500, error.message || "Internal Server Error", "Fetching Error");
  }
};