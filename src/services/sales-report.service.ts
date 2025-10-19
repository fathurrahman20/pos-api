import { Op, Sequelize, WhereOptions } from "sequelize";
import { Order } from "../models/order";
import { OrderItem } from "../models/orderitem";
import { Product } from "../models/product";
import { Category } from "../models/category";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { format } from "date-fns";

interface SalesReportParams {
  cashierId?: number;
  filters: {
    startDate?: string;
    endDate?: string;
    orderType?: "dine-in" | "take-away";
    categoryId?: number;
  };
  pagination: {
    page: number;
    limit: number;
  };
}

interface SalesDetailResult {
  "category.name": string;
  name: string;
  totalSold: string;
}

const generatePdfTable = (
  doc: PDFKit.PDFDocument,
  table: { headers: string[]; rows: string[][] }
) => {
  let y = doc.y;
  const { headers, rows } = table;
  const tableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const columnWidths = [
    tableWidth * 0.28, // Order
    tableWidth * 0.18, // Date
    tableWidth * 0.12, // Type
    tableWidth * 0.22, // Customer
    tableWidth * 0.2, // Total
  ];
  const cellPadding = 5;

  const getRowHeight = (row: string[]): number => {
    let maxHeight = 0;
    row.forEach((text, i) => {
      const height = doc.heightOfString(text, {
        width: columnWidths[i] - cellPadding * 2,
        align: "left",
      });
      if (height > maxHeight) {
        maxHeight = height;
      }
    });
    return maxHeight + cellPadding * 2;
  };

  const drawRow = (row: string[], yPos: number, rowHeight: number) => {
    let xPos = doc.page.margins.left;
    row.forEach((text, i) => {
      doc.rect(xPos, yPos, columnWidths[i], rowHeight).stroke();
      doc.text(text, xPos + cellPadding, yPos + cellPadding, {
        width: columnWidths[i] - cellPadding * 2,
        align: "left",
      });
      xPos += columnWidths[i];
    });
  };

  doc.font("Helvetica-Bold");
  const headerHeight = getRowHeight(headers);
  drawRow(headers, y, headerHeight);
  y += headerHeight;

  doc.font("Helvetica");
  for (const row of rows) {
    const rowHeight = getRowHeight(row);

    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;

      doc.font("Helvetica-Bold");
      const newHeaderHeight = getRowHeight(headers);
      drawRow(headers, y, newHeaderHeight);
      y += newHeaderHeight;
      doc.font("Helvetica");
    }

    drawRow(row, y, rowHeight);
    y += rowHeight;
  }

  doc.y = y;
};

export const salesReportService = {
  async generateSalesReport(params: SalesReportParams) {
    const { cashierId, filters, pagination } = params;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const whereCondition: WhereOptions = {};
    if (cashierId) whereCondition.cashierId = cashierId;
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
    }
    if (filters.orderType) whereCondition.orderType = filters.orderType;

    if (filters.categoryId) {
      const filteredOrders = await Order.findAll({
        attributes: ["id"],
        where: whereCondition,
        include: [
          {
            model: OrderItem,
            as: "items",
            attributes: [],
            required: true,
            include: [
              {
                model: Product,
                as: "product",
                attributes: [],
                required: true,
                include: [
                  {
                    model: Category,
                    as: "category",
                    attributes: [],
                    required: true,
                    where: { id: filters.categoryId },
                  },
                ],
              },
            ],
          },
        ],
        raw: true,
      });

      const orderIds = filteredOrders.map((order: { id: number }) => order.id);

      if (orderIds.length === 0) {
        return {
          summary: {
            totalOrder: 0,
            totalOmzet: 0,
            allMenuSales: 0,
            salesByCategory: {},
          },
          orders: { data: [], currentPage: 1, totalPages: 0, totalItems: 0 },
        };
      }
      whereCondition.id = { [Op.in]: orderIds };
    }

    const totalOrder = await Order.count({
      where: whereCondition,
      distinct: true,
    });
    const totalOmzet =
      (await Order.sum("grandTotal", { where: whereCondition })) || 0;
    const allMenuSales =
      (await OrderItem.sum("quantity", {
        include: [
          {
            model: Order,
            as: "order",
            where: whereCondition,
            attributes: [],
            required: true,
          },
        ],
      } as any)) || 0;

    // Query untuk mendapatkan detail penjualan per produk, di-group berdasarkan produk dan kategori
    const salesDetailData = (await Product.findAll({
      attributes: [
        "name",
        // Hitung jumlah total item terjual untuk produk ini
        [Sequelize.fn("SUM", Sequelize.col("items.quantity")), "totalSold"],
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["name"],
          required: true,
        },
        {
          model: OrderItem,
          as: "items",
          attributes: [],
          required: true,
          include: [
            {
              model: Order,
              as: "order",
              where: whereCondition,
              attributes: [],
              required: true,
            },
          ],
        },
      ],
      group: ["Product.id", "category.id"],
      raw: true,
    })) as unknown as SalesDetailResult[];

    const salesByCategory = salesDetailData.reduce((acc, item) => {
      const categoryName = item["category.name"];
      const productName = item.name;
      const totalSold = parseInt(item.totalSold, 10) || 0;

      if (!acc[categoryName]) {
        acc[categoryName] = {};
      }

      acc[categoryName][productName] = totalSold;

      return acc;
    }, {} as Record<string, Record<string, number>>);

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                { model: Category, as: "category", attributes: ["name"] },
              ],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    const formattedOrders = orders.map((order) => {
      const categories = [
        ...new Set(
          order.items
            ?.map((item) => item.product?.category?.name)
            .filter(Boolean) as string[]
        ),
      ];
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        orderType: order.orderType,
        customerName: order.customerName,
        category: categories.join(", "),
        grandTotal: order.grandTotal,
      };
    });

    return {
      summary: { totalOrder, totalOmzet, allMenuSales, salesByCategory },
      orders: {
        data: formattedOrders,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    };
  },
  async _getFullReportData(params: Omit<SalesReportParams, "pagination">) {
    const { cashierId, filters } = params;

    const whereCondition: WhereOptions = {};
    if (cashierId) whereCondition.cashierId = cashierId;
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
    }
    if (filters.orderType) whereCondition.orderType = filters.orderType;

    if (filters.categoryId) {
      const filteredOrders = await Order.findAll({
        attributes: ["id"],
        where: whereCondition,
        include: [
          {
            model: OrderItem,
            as: "items",
            attributes: [],
            required: true,
            include: [
              {
                model: Product,
                as: "product",
                attributes: [],
                required: true,
                include: [
                  {
                    model: Category,
                    as: "category",
                    attributes: [],
                    required: true,
                    where: { id: filters.categoryId },
                  },
                ],
              },
            ],
          },
        ],
        raw: true,
      });

      const orderIds = filteredOrders.map((order: { id: number }) => order.id);
      if (orderIds.length === 0) {
        whereCondition.id = { [Op.in]: [] };
      } else {
        whereCondition.id = { [Op.in]: orderIds };
      }
    }

    const totalOrder = await Order.count({
      where: whereCondition,
      distinct: true,
    });
    const totalOmzet =
      (await Order.sum("grandTotal", { where: whereCondition })) || 0;
    const allMenuSales =
      (await OrderItem.sum("quantity", {
        include: [
          {
            model: Order,
            as: "order",
            where: whereCondition,
            attributes: [],
            required: true,
          },
        ],
      } as any)) || 0;

    const salesDetailData = (await Product.findAll({
      attributes: [
        "name",
        [Sequelize.fn("SUM", Sequelize.col("items.quantity")), "totalSold"],
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["name"],
          required: true,
        },
        {
          model: OrderItem,
          as: "items",
          attributes: [],
          required: true,
          include: [
            {
              model: Order,
              as: "order",
              where: whereCondition,
              attributes: [],
              required: true,
            },
          ],
        },
      ],
      group: ["Product.id", "category.id"],
      raw: true,
    })) as unknown as SalesDetailResult[];

    const salesByCategory = salesDetailData.reduce((acc, item) => {
      const categoryName = item["category.name"];
      const productName = item.name;
      const totalSold = parseInt(item.totalSold, 10) || 0;
      if (!acc[categoryName]) acc[categoryName] = {};
      acc[categoryName][productName] = totalSold;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    const orders = await Order.findAll({
      where: whereCondition,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                { model: Category, as: "category", attributes: ["name"] },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedOrders = orders.map((order) => {
      const categories = [
        ...new Set(
          order.items
            ?.map((item) => item.product?.category?.name)
            .filter(Boolean) as string[]
        ),
      ];
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        orderType: order.orderType,
        customerName: order.customerName,
        category: categories.join(", "),
        grandTotal: Number(order.grandTotal),
      };
    });

    return {
      summary: { totalOrder, totalOmzet, allMenuSales, salesByCategory },
      orders: formattedOrders,
    };
  },
  async exportSalesReportExcel(params: Omit<SalesReportParams, "pagination">) {
    const { summary, orders } = await this._getFullReportData(params);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Your App Name";
    workbook.lastModifiedBy = "Your App Name";
    workbook.created = new Date();
    workbook.modified = new Date();

    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.addRow(["Sales Report Summary"]).font = {
      bold: true,
      size: 16,
    };
    summarySheet.addRow([]);

    summarySheet.addRow(["Total Order", summary.totalOrder]);
    summarySheet.addRow(["Total Omzet", summary.totalOmzet]).getCell(2).numFmt =
      '"Rp"#,##0';
    summarySheet.addRow(["All Menu Sales", summary.allMenuSales]);
    summarySheet.addRow([]);

    summarySheet.addRow(["Sales by Category"]).font = { bold: true };
    Object.entries(summary.salesByCategory).forEach(
      ([categoryName, products]) => {
        summarySheet.addRow([categoryName]).font = {
          bold: true,
          color: { argb: "FF0070C0" },
        };
        summarySheet.addRow(["Product", "Total Sold"]);
        Object.entries(products).forEach(([productName, totalSold]) => {
          summarySheet.addRow([`  ${productName}`, totalSold]);
        });
      }
    );

    summarySheet.columns.forEach((column) => {
      column.width = 30;
    });

    const ordersSheet = workbook.addWorksheet("Orders");
    ordersSheet.columns = [
      { header: "Order Number", key: "orderNumber", width: 20 },
      {
        header: "Order Date",
        key: "orderDate",
        width: 25,
        style: { numFmt: "dd/mm/yyyy hh:mm" },
      },
      { header: "Order Type", key: "orderType", width: 15 },
      { header: "Customer Name", key: "customerName", width: 25 },
      { header: "Category", key: "category", width: 30 },
      {
        header: "Grand Total",
        key: "grandTotal",
        width: 20,
        style: { numFmt: '"Rp"#,##0' },
      },
    ];
    ordersSheet.getRow(1).font = { bold: true };
    ordersSheet.addRows(orders);

    return workbook.xlsx.writeBuffer();
  },
  async exportSalesReportPdf(
    params: Omit<SalesReportParams, "pagination">
  ): Promise<Buffer> {
    const { summary, orders } = await this._getFullReportData(params);

    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });
      const buffers: any[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Sales Report", { align: "center" });
      doc.moveDown(2);

      doc.fontSize(14).font("Helvetica-Bold").text("Summary");
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica");
      doc.text(`Total Order: ${summary.totalOrder}`);
      doc.text(`Total Omzet: Rp ${summary.totalOmzet.toLocaleString("id-ID")}`);
      doc.text(`All Menu Sales: ${summary.allMenuSales}`);
      doc.moveDown(1.5);

      doc.fontSize(14).font("Helvetica-Bold").text("Sales by Category");
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica");
      Object.entries(summary.salesByCategory).forEach(
        ([categoryName, products]) => {
          doc.font("Helvetica-Bold").text(categoryName);
          Object.entries(products).forEach(([productName, totalSold]) => {
            doc.font("Helvetica").text(`  - ${productName}: ${totalSold} sold`);
          });
          doc.moveDown(0.5);
        }
      );
      doc.moveDown(1);

      doc.fontSize(14).font("Helvetica-Bold").text("All Orders");
      doc.moveDown(0.5);

      const table = {
        headers: ["Order #", "Date", "Type", "Customer", "Total"],
        rows: orders.map((order) => [
          order.orderNumber,
          format(new Date(order.orderDate), "dd/MM/yy HH:mm"),
          order.orderType,
          order.customerName || "-",
          `Rp ${order.grandTotal.toLocaleString("id-ID")}`,
        ]),
      };

      generatePdfTable(doc, table);

      doc.end();
    });
  },
};
