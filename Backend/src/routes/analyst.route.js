import express from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { validateStoreAccess } from "../middleware/validateStoreAccess.js";
import { allAnalyst } from "../controller/Analyst/get/index.js";
import { recentActivity } from "../controller/recentActivity/get/index.js";
import { exportSalesReport } from "../controller/salesReport/index.js";

const router = express.Router();


router.get("/",verifyJWT, validateStoreAccess,allAnalyst);
router.get("/recent-activity",verifyJWT,validateStoreAccess, recentActivity);
// Sales report endpoints
router.get('/export', verifyJWT, validateStoreAccess,exportSalesReport);


export default router