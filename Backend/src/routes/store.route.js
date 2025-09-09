import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import {
  createStore,
  getStores,
  updateStore,
  deleteStore,
  getStoreById
  
} from "../controller/store/index.js";

const router = Router();

router.post("/create", verifyJWT, createStore);
router.get("/", verifyJWT, getStores);
router.get("/:id", verifyJWT, getStoreById);
router.put("/update/:id", verifyJWT, updateStore);
router.put("/delete/:id", verifyJWT, deleteStore);

export default router;
