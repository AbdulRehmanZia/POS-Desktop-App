import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

export const addSale = async (req, res) => {
  try {
    const storeId = req.store.id;
    const userId = req.user.id;
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

    // Check if store exists
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return ApiError(res, 404, null, "Store not found");

    const productIds = items.map((i) => i.productId);

    const sale = await prisma.$transaction(async (tx) => {
      // Fetch all products in one query
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isDeleted: false, storeId },
        select: { id: true, price: true, stockQuantity: true, name: true },
      });

      if (products.length !== productIds.length) {
        throw new Error("Some products are missing or deleted");
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      let totalAmount = 0;
      const saleItemData = [];

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
      }

      // 🔹 Bulk stock update in one go using Promise.all (still safe)
      const updates = items.map((item) =>
        tx.product.updateMany({
          where: { id: item.productId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      );

      const results = await Promise.all(updates);

      // Check if any stock update failed
      results.forEach((r, idx) => {
        if (r.count === 0) {
          const product = productMap.get(items[idx].productId);
          throw new Error(`Stock update failed for ${product.name}`);
        }
      });

      // Create the sale and saleItems
      return await tx.sale.create({
        data: {
          storeId,
          userId,
          paymentType,
          totalAmount,
          customerName,
          customerEmail,
          customerPhone,
          saleItems: { create: saleItemData },
        },
        include: { saleItems: { include: { product: true } } },
      });
    });

    return ApiResponse(res, 201, sale, "Sale Generated Successfully");
  } catch (error) {
    console.error("Sale creation error:", error);

    if (error.message?.includes("Insufficient stock") || error.message?.includes("Stock update failed")) {
      return ApiError(res, 409, error.message);
    }

    if (error.message?.includes("missing or deleted") || error.message?.includes("not found")) {
      return ApiError(res, 400, error.message);
    }

    return ApiError(res, 500, "Internal Server Error", error);
  }
};
