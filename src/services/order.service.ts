import NotFoundError from "../errors/not-found.error";
import { Order, OrderItem } from "../models";

export const orderServices = {
  async getAllOrders(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Order.findAndCountAll({
      offset,
      limit,
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      totalItems: count,
      totalPages,
      currentPage: page,
    };
  },

  async getOrderById(id: number) {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return order;
  },
};
