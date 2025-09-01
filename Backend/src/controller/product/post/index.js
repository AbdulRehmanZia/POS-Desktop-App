import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Add Product
export const addProduct = async (req, res) => {
  try {
    const storeId = req.store.id;
    let { name, price, costPrice, stockQuantity, unit, categoryId, barcode } = req.body;

    if (!name || !price || !costPrice || !stockQuantity || !unit || !categoryId) {
      return ApiError(res, 400, null, "Please Fill The Required Fields");
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    });

    if (!store) {
      return ApiError(res, 404, null, "Store not found");
    }

    const userPlan = store.owner.plan;

    const planLimits = {
      basic: 100,
      standard: 1000,
      premium: Infinity, 
    };

    const productCount = await prisma.product.count({
      where: { storeId, isDeleted: false },
    });

    if (productCount >= planLimits[userPlan]) {
      return ApiError(
        res,
        403,
        null,
        `Product limit reached for your plan (${userPlan}). Upgrade to add more.`
      );
    }

    // Normalize product name
    let productName = name.trim().toLowerCase().replace(/\s+/g, " ");

    const category = await prisma.category.findFirst({
      where: {
        id: Number(categoryId),
        storeId,
        isDeleted: false,
      },
    });

    if (!category) {
      return ApiError(res, 404, null, "Category not found in this store");
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        name: productName,
        storeId,
      },
    });

    if (existingProduct) {
      if (!existingProduct.isDeleted) {
        return ApiError(res, 400, null, "This Product Already Exists in this store");
      } else {
        // Restore product
        const restoredProduct = await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            isDeleted: false,
            price: parseFloat(price),
            costPrice: parseFloat(costPrice),
            stockQuantity: parseInt(stockQuantity),
            unit,
            categoryId: Number(categoryId),
          },
        });
        return ApiResponse(res, 200, restoredProduct, "Product Restored Successfully");
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        name: productName,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
        stockQuantity: parseInt(stockQuantity),
        unit,
        barcode,
        storeId,
        categoryId: Number(categoryId),
      },
    });

    return ApiResponse(res, 201, newProduct, "Product added successfully");
  } catch (error) {
    console.error("Error in addProduct:", error);
    return ApiError(res, 500, null, "Internal Server Error");
  }
};
