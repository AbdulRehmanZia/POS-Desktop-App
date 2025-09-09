import { Router } from "express";

import { verifyJWT } from "../middleware/authMiddleware.js";
import authorizeRole from "../middleware/authorizeRoles.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controller/product/index.js";
import { validateStoreAccess } from "../middleware/validateStoreAccess.js";

const router = Router();

router.get(
  "/",
  verifyJWT,
  validateStoreAccess,
  getAllProducts
);
router.post("/add-product", verifyJWT, validateStoreAccess,authorizeRole("admin"), addProduct);
router.put(
  "/update-product/:id",
   verifyJWT,
   validateStoreAccess,
  authorizeRole("admin"),
  updateProduct
);
router.delete(
  "/delete-product/:id",
   verifyJWT,
   validateStoreAccess,
  authorizeRole("admin"),
  deleteProduct
);

export default router;
