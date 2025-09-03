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

const router = Router();

//Public
router.post("/register", registerUser);
router.post("/login", loginUser);

//Protected
router.get("/", verifyJWT, getUsers);
router.post("/logout", verifyJWT, logoutUser);
router.put("/update/:id", verifyJWT, updateUser);
router.put("/change-password", verifyJWT, changePassword)
router.put("/delete/:id", verifyJWT, deleteUser);
router.post("/refresh-token", verifyJWT, refreshAccessToken);
router.post("/forget-password", forgetPassword)
router.post("/reset-password", resetPassword)

export default router;
