import { Request, Response } from "express";
import BadRequestError from "../errors/bad-request.error";
import { salesReportService } from "../services/salesReport.service";

export const getSalesReport = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  let filterCashierId: number | undefined;

  if (role === "admin") {
    filterCashierId = undefined;
  } else {
    filterCashierId = userId;
    if (!filterCashierId) {
      throw new BadRequestError("Cashier ID not found.");
    }
  }

  const {
    startDate,
    endDate,
    orderType,
    categoryId,
    page = 1,
    limit = 10,
  } = req.query;

  const reportData = await salesReportService.generateSalesReport({
    cashierId: filterCashierId,
    filters: {
      startDate: startDate as string,
      endDate: endDate as string,
      orderType: orderType as "dine-in" | "take-away",
      categoryId: categoryId ? Number(categoryId) : undefined,
    },
    pagination: {
      page: Number(page),
      limit: Number(limit),
    },
  });

  res.status(200).json({
    success: true,
    message: "Sales report generated successfully",
    data: reportData,
  });
};
