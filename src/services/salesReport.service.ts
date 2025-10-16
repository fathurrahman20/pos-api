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

interface CategorySaleResult {
  id: number;
  name: string;
  totalItemsSold: string;
}

export const salesReportService = {
  async generateSalesReport(params: SalesReportParams) {
    const { cashierId, filters, pagination } = params;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const whereCondition: WhereOptions = {};

    if (cashierId) {
      whereCondition.cashierId = cashierId;
    }

    const includeCondition: Includeable[] = [];

    if (filters.startDate && filters.endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)],
      };
    }

    if (filters.orderType) {
      whereCondition.orderType = filters.orderType;
    }

    const categoryFilter: Includeable = {
      model: OrderItem,
      as: "items",
      attributes: [],
      include: [
        {
          model: Product,
          as: "product",
          attributes: [],
          include: [
            {
              model: Category,
              as: "category",
              attributes: [],
              where: filters.categoryId
                ? { id: filters.categoryId }
                : undefined,
            },
          ],
          required: true,
        },
      ],
      required: true,
    };

    if (filters.categoryId) {
      includeCondition.push(categoryFilter);
    }

    const totalOrder = await Order.count({
      where: whereCondition,
      include: includeCondition,
    });
    const totalOmzet =
      (await Order.sum("grandTotal", {
        where: whereCondition,
        include: includeCondition,
      } as any)) || 0;

    const allMenuSales =
      (await OrderItem.sum("quantity", {
        include: [
          {
            model: Order,
            as: "order",
            where: whereCondition,
            attributes: [],
            required: true,
            include: filters.categoryId ? includeCondition : [],
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
          required: true,
        },
      ],
      group: ["Category.id", "Category.name"],
      raw: true,
    })) as unknown as CategorySaleResult[];

    const salesByCategory = salesByCategoryData.reduce(
      (acc: Record<string, number>, category) => {
        acc[category.name] = parseInt(category.totalItemsSold, 10) || 0;
        return acc;
      },
      {}
    );

    const { rows: orders, count } = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        ...includeCondition,
        {
          model: OrderItem,
          as: "items",
          attributes: ["id"],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["name"],
                },
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
      summary: {
        totalOrder,
        totalOmzet,
        allMenuSales,
        salesByCategory,
      },
      orders: {
        data: formattedOrders,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    };
  },
};
