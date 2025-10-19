import { Router } from "express";
import {
  exportSalesReportToExcel,
  exportSalesReportToPdf,
  getSalesReport,
} from "../controllers/sales-report.controller";
import { authenticate } from "../middleware/auth.middleware";

const salesReportRoutes = Router();

salesReportRoutes.get("/sales-report", authenticate, getSalesReport);
salesReportRoutes.get(
  "/sales-report/export/excel",
  authenticate,
  exportSalesReportToExcel
);
salesReportRoutes.get(
  "/sales-report/export/pdf",
  authenticate,
  exportSalesReportToPdf
);

export default salesReportRoutes;
