import prisma from "../../../db/db.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js";

// Delete Sale (soft)
export const deleteSale = async (req, res) => {
  try {
    const saleId = Number(req.params.id);
    const storeId = req.store.id; 

    const saleExist = await prisma.sale.findFirst({
      where: { id: saleId, storeId, isDeleted: false },
    });

    if (!saleExist) {
      return ApiError(res, 404, null, "Sale not found in this store");
    }

    await prisma.$transaction(async (tx) => {
      await tx.saleItem.updateMany({
        where: { saleId, storeId },
        data: { isDeleted: true },
      });

      await tx.sale.update({
        where: { id: saleId },
        data: { isDeleted: true },
      });
    });

    return ApiResponse(res, 200, null, "Sale successfully deleted (soft)");
  } catch (error) {
    console.error("Sale Delete Error:", error);
    return ApiError(res, 500, error.message || "Internal Server Error");
  }
};
