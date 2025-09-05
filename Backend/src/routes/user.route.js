import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import {
  changePassword,
  deleteUser,
  forgetPassword,
  getUsers,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  updateUser,
} from "../controller/user/index.js";
import { updatePlan } from "../controller/user/updatePlan/index.js";
import { superAdminMiddleware } from "../middleware/superAdminMiddleware.js";

const router = Router();

//Public
router.post("/register", registerUser);
router.post("/login", loginUser);

//Protected
router.put("/update-plan/:id",superAdminMiddleware, updatePlan)
router.get("/", superAdminMiddleware, getUsers);
router.post("/logout", verifyJWT, logoutUser);
router.put("/update/:id", superAdminMiddleware, updateUser);
router.put("/change-password", verifyJWT, changePassword)
router.put("/delete/:id", superAdminMiddleware, deleteUser);
router.post("/refresh-token", verifyJWT, refreshAccessToken);
router.post("/forget-password", forgetPassword)
router.post("/reset-password", resetPassword)

export default router;
