import { Router } from "express";

import { verifyJWT } from "../middleware/authMiddleware.js";
import authorizeRole from "../middleware/authorizeRoles.js";
import { addSale, deleteSale, getSales } from "../controller/sale/index.js";
import { validateStoreAccess } from "../middleware/validateStoreAccess.js";

const router = Router();

router.get("/",verifyJWT,validateStoreAccess, getSales);
router.post("/add-sale",verifyJWT,validateStoreAccess, addSale);

router.put(
  "/delete-sale/:id",
  verifyJWT,
  validateStoreAccess,
  authorizeRole("admin"),
  deleteSale
);

export default router;
