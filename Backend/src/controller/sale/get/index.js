import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const getSales = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    if (page < 1) page = 1;
    if (limit <= 0 || limit > 100) limit = 10;

    const skip = (page - 1) * limit;

    const {
      q: name,
      startDate,
      endDate,
      customerName,
      paymentType,
      category,
    } = req.query;

    // Enforce store
    const storeId = req.store.id;

    let whereClause = { storeId };

    // Product filter
    if (name) {
      whereClause.saleItems = {
        some: {
          product: {
            name: { contains: name, mode: "insensitive" },
          },
        },
      };
    }

    // Date filter
    if (startDate && endDate) {
      if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
        return ApiError(res, 400, null, "Invalid date format");
      }
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // Customer filter
    if (customerName) {
      whereClause.customerName = {
        contains: customerName,
        mode: "insensitive",
      };
    }

    // Payment Type filter
    if (paymentType) {
      whereClause.paymentType = paymentType;
    }

    // Category filter
    if (category) {
      whereClause.saleItems = {
        some: {
          product: {
            category: {
              is: {
                name: { contains: category, mode: "insensitive" },
              },
            },
          },
        },
      };
    }

    // Fetch sales
    const sales = await prisma.sale.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        saleItems: { include: { product: true } },
      },
    });

    const totalSales = await prisma.sale.count({ where: whereClause });
    const totalPages = Math.ceil(totalSales / limit);

    return ApiResponse(res, 200, sales, "Sales fetched successfully", {
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    console.error("Error in getSales:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};
