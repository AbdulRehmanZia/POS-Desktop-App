import { Router } from "express";

import { verifyJWT } from "../middleware/authMiddleware.js";
import authorizeRole from "../middleware/authorizeRoles.js";
import {
  addStoreMember,
  deleteStoreMember,
  getAllStoreMembers,
  updateStoreMember,
} from "../controller/member/index.js";
import { validateStoreAccess } from "../middleware/validateStoreAccess.js";

const router = Router();

router.get("/", verifyJWT, validateStoreAccess,getAllStoreMembers);
router.post("/add-member", verifyJWT, validateStoreAccess,authorizeRole("admin"), addStoreMember);
router.put(
  "/update-member/:id",
  verifyJWT,
  validateStoreAccess,
  authorizeRole("admin"),
  updateStoreMember
);
router.delete(
  "/delete-member/:id",
  verifyJWT,
  validateStoreAccess,
  authorizeRole("admin"),
  deleteStoreMember
);

export default router;
