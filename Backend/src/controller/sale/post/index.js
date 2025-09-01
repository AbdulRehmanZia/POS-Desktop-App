import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const addSale = async (req, res) => {
  try {
    const { paymentType, items, customerName, customerEmail, customerPhone } = req.body;

    // Basic validation
    if (!paymentType || !Array.isArray(items) || items.length === 0) {
      return ApiError(res, 400, "Invalid Sale Data");
    }

    for (const item of items) {
      if (!item.productId || item.quantity <= 0) {
        return ApiError(res, 400, "Invalid product data in items");
      }
    }

    const productIds = items.map((item) => item.productId);

    const sale = await prisma.$transaction(async (tx) => {
      
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isDeleted: false,
          storeId: req.store.id, 
        },
        select: {
          id: true,
          price: true,
          stockQuantity: true,
          name: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("Some products are missing or deleted");
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      
      // Validate stock and calculate total
      let totalAmount = 0;
      const saleItemData = [];
      
      const stockUpdates = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        totalAmount += product.price * item.quantity;
        
        saleItemData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtSale: product.price,
        });

        stockUpdates.push({
          id: item.productId,
          newStock: product.stockQuantity - item.quantity,
        });
      }

      // Optimized bulk stock update - Update all products in a single operation
      // Method 1: Using updateMany with OR conditions (most efficient for Prisma)
      await Promise.all(
  items.map((item) =>
    tx.product.updateMany({
      where: {
        id: item.productId,
        stockQuantity: { gte: item.quantity }, 
      },
      data: { stockQuantity: { decrement: item.quantity } },
    })
  )
);


      
      
      

      // Create Sale
      return await tx.sale.create({
        data: {
          storeId: req.store.id,
          userId: req.user.id,
          paymentType,
          totalAmount,
          customerName,
          customerEmail,
          customerPhone,
          saleItems: { create: saleItemData },
        },
        include: {
          saleItems: { include: { product: true } },
        },
      });
    });

    return ApiResponse(res, 201, sale, "Sale Generated Successfully");
  } catch (error) {
    console.error("Sale creation error:", error);
    return ApiError(res, 500, error.message || "Internal Server Error");
  }
};

