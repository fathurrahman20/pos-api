import { Request, Response } from "express";
import BadRequestError from "../errors/bad-request.error";
import { salesReportService } from "../services/sales-report.service";

const getReportParams = (req: Request) => {
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

  const { startDate, endDate, orderType, categoryId } = req.query;

  const filters = {
    startDate: startDate as string,
    endDate: endDate as string,
    orderType: orderType as "dine-in" | "take-away",
    categoryId: categoryId ? Number(categoryId) : undefined,
  };

  return { filterCashierId, filters };
};

export const getSalesReport = async (req: Request, res: Response) => {
  const { filterCashierId, filters } = getReportParams(req);

  const { page = 1, limit = 10 } = req.query;

  const reportData = await salesReportService.generateSalesReport({
    cashierId: filterCashierId,
    filters,
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

export const exportSalesReportToExcel = async (req: Request, res: Response) => {
  try {
    const { filterCashierId, filters } = getReportParams(req);

    const buffer = await salesReportService.exportSalesReportExcel({
      cashierId: filterCashierId,
      filters,
    });

    const filename = `sales-report-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to export Excel report." });
  }
};

export const exportSalesReportToPdf = async (req: Request, res: Response) => {
  try {
    const { filterCashierId, filters } = getReportParams(req);

    const buffer = await salesReportService.exportSalesReportPdf({
      cashierId: filterCashierId,
      filters,
    });

    const filename = `sales-report-${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to export PDF report." });
  }
};
