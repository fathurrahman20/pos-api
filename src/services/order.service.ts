import { Op } from "sequelize";
import NotFoundError from "../errors/not-found.error";
import { Order, OrderItem, Product, sequelize, User } from "../models";
import { CreateOrderSchema } from "../schema/order.schema";
import BadRequestError from "../errors/bad-request.error";

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
  async createOrder(data: CreateOrderSchema, cashierId: number) {
    const {
      customerName,
      orderType,
      tableNumber,
      items: products,
      amountPaid,
      paymentMethod = "cash",
    } = data;

    const transaction = await sequelize.transaction();

    const productIds = products.map((p) => p.productId);
    const foundProducts = await Product.findAll({
      where: { id: productIds },
    });

    // validasi jika ada menu yang tidak ditemukan
    if (foundProducts.length !== productIds.length) {
      await transaction.rollback();
      throw new NotFoundError("Satu atau lebih menu tidak ditemukan");
    }

    const productMap = new Map(foundProducts.map((p) => [p.id, p]));

    let subtotal = 0;

    const items = products.map((product) => {
      const itemData = productMap.get(product.productId)!;
      subtotal += itemData.price * product.quantity;
      return {
        productId: itemData.id,
        quantity: product.quantity,
        price: itemData.price,
        notes: product.notes,
      };
    });

    const TAX_RATE = Number(process.env.TAX_RATE) || 0.11;
    const taxAmount = subtotal * TAX_RATE; // Pajak 11%

    const grandTotal = subtotal + taxAmount;

    if (amountPaid < grandTotal) {
      await transaction.rollback();
      throw new BadRequestError("Jumlah pembayaran tidak mencukupi");
    }

    const change = amountPaid - grandTotal;

    const orderNumber = await generateOrderNumber();

    const createdOrder = await Order.create(
      {
        customerName,
        orderType,
        tableNumber,
        subtotal,
        taxAmount,
        grandTotal,
        amountPaid,
        paymentMethod,
        cashierId,
        orderNumber,
        status: "paid",
      },
      { transaction }
    );

    for (const item of items) {
      await OrderItem.create(
        {
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const newOrder = await Order.findByPk(createdOrder.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: {
            exclude: ["productId", "createdAt", "updatedAt"],
          },
          include: [
            {
              model: Product,
              as: "product",
              attributes: {
                exclude: [
                  "categoryId",
                  "description",
                  "imageId",
                  "image",
                  "createdAt",
                  "updatedAt",
                ],
              },
            },
          ],
        },
        {
          model: User,
          as: "cashier",
          attributes: {
            exclude: [
              "email",
              "password",
              "role",
              "image",
              "resetPasswordToken",
              "resetPasswordExpires",
              "status",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      ],
      attributes: {
        exclude: ["cashierId", "updatedAt"],
      },
    });

    if (!newOrder) {
      await transaction.rollback();
      throw new NotFoundError("Order tidak ditemukan setelah pembuatan.");
    }

    return { ...newOrder.toJSON(), change };
  },
};

async function generateOrderNumber() {
  // get tanggal hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0); // set ke awal hari

  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  const datePrefix = `${year}${month}${day}`; // contoh hasil: "20251013"

  // cari order terakhir yang dibuat pada hari ini (dalam sebuah transaksi)
  const lastOrderToday = await Order.findOne({
    where: {
      createdAt: {
        [Op.gte]: today, // Op.gte: "greater than or equal to"
      },
    },
    order: [["createdAt", "DESC"]], // urutkan dari yang terbaru
  });

  let sequence = 1; // default sequence jika ini order pertama hari ini

  // jika sudah ada order hari ini, ambil nomor urutnya dan +1
  if (lastOrderToday) {
    const lastOrderNumber = lastOrderToday.orderNumber; // misal: "ORD-20251013-0015"
    const lastSequence = parseInt(lastOrderNumber.split("-")[2]);
    sequence = lastSequence + 1;
  }

  // format nomor urut dengan padding nol (misal: 1 -> "0001", 16 -> "0016")
  const paddedSequence = sequence.toString().padStart(4, "0");

  // gabungkan menjadi nomor order final
  const newOrderNumber = `ORD-${datePrefix}-${paddedSequence}`; // Hasil: "ORD-20251013-0001"

  return newOrderNumber;
}
