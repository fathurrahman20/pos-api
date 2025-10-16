import { Router } from "express";
import { getSalesReport } from "../controllers/salesReport.controller";
import { authenticate } from "../middleware/auth.middleware";

const salesReportRoutes = Router();

salesReportRoutes.get("/sales-report", authenticate, getSalesReport);

export default salesReportRoutes;
