import prisma from "../db/db.js";
import ApiError from "../utils/ApiError.js";

export const validateStoreAccess = async (req, res, next) => {
  try {
    const storeId = req.headers["store-id"];

    if (!storeId) {
      return ApiError(res, 400, "Store ID is required");
    }

    const store = await prisma.store.findFirst({
      where: {
        id: Number(storeId),
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ],
        isDeleted: false
      }
    });

    if (!store) {
      return ApiError(res, 403, "No access to this store");
    }

    req.store = store;
    next();
  } catch (error) {
    console.error("Store validation error:", error);
    return ApiError(res, 500, "Internal Server Error");
  }
};