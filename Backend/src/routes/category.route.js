import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import authorizeRole from "../middleware/authorizeRoles.js";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controller/category/index.js";
import { validateStoreAccess } from "../middleware/validateStoreAccess.js";
const router = Router();

router.get("/", verifyJWT, validateStoreAccess, getAllCategories);
router.post("/add-category", verifyJWT, validateStoreAccess, authorizeRole("admin"), addCategory);
router.put(
  "/update-category/:id",
  verifyJWT,
  validateStoreAccess,
  authorizeRole("admin"),
  updateCategory
);
router.delete(
  "/delete-category/:id",
  verifyJWT,
  validateStoreAccess,
  authorizeRole("admin"),
  deleteCategory
);

export default router;
