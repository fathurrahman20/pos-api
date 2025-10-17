import { Op, Sequelize, WhereOptions, Includeable } from "sequelize";
import { Order } from "../models/order";
import { OrderItem } from "../models/orderitem";
import { Product } from "../models/product";
import { Category } from "../models/category";

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

    const salesByCategoryData = (await Category.findAll({
      attributes: [
        "id",
        "name",
        [
          Sequelize.fn("SUM", Sequelize.col("products.items.quantity")),
          "totalItemsSold",
        ],
      ],
      include: [
        {
          model: Product,
          as: "products",
          attributes: [],
          required: true,
          include: [
            {
              model: OrderItem,
              as: "items",
              attributes: [],
              required: true,
              include: [
                {
                  model: Order,
                  as: "order",
                  attributes: [],
                  where: whereCondition,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      group: ["Category.id", "Category.name"],
      raw: true,
    })) as any;

    const salesByCategory = salesByCategoryData.reduce(
      (acc: Record<string, number>, category: any) => {
        acc[category.name] = parseInt(category.totalItemsSold, 10) || 0;
        return acc;
      },
      {}
    );

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
};
