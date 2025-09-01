import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const getAllProducts = async (req, res) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const category = req.query.category || "";
  const minPrice = Number(req.query.minPrice) || 0;
  const minStock = Number(req.query.minStock) || 0;

  if (page < 1) page = 1;
  if (limit <= 0 || limit > 100) limit = 10;
  const skip = (page - 1) * limit;

  try {
    const whereClause = {
      isDeleted: false,
       storeId: req.store.id,
      AND: [
        { name: { contains: search, mode: "insensitive" } },
        { price: { gte: minPrice } },
        { stockQuantity: { gte: minStock } },
      ],
    };

    if (category) {
      whereClause.AND.push({ categoryId: Number(category) });
    }

    if (req.query.maxPrice) {
      whereClause.AND.push({ price: { lte: Number(req.query.maxPrice) } });
    }

    if (req.query.maxStock) {
      whereClause.AND.push({ stockQuantity: { lte: Number(req.query.maxStock) } });
    }

    const allProduct = await prisma.product.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    const totalProducts = await prisma.product.count({ where: whereClause });
    const totalPages = Math.ceil(totalProducts / limit);

    return ApiResponse(
      res,
      200,
      allProduct,
      "All Products retrieved successfully",
      {
        totalPages,
        currentPage: page,
        limit,
        totalItems: totalProducts,
      }
    );
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return ApiError(res, 500, "Internal Server Error", error);
  }
};
