import express from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { validateStoreAccess } from "../middleware/validateStoreAccess.js";
import { allAnalyst } from "../controller/Analyst/get/index.js";
import { recentActivity } from "../controller/recentActivity/get/index.js";

const router = express.Router();


router.get("/",verifyJWT, validateStoreAccess,allAnalyst);
router.get("/recent-activity",verifyJWT,validateStoreAccess, recentActivity);


export default router