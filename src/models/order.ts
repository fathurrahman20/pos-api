import { Model, DataTypes, Sequelize } from "sequelize";
import { User } from "./user";
import { OrderItem } from "./orderitem";

export class Order extends Model {
  public id!: number;
  public customerName!: string;
  public orderType!: "dine-in" | "take-away";
  public tableNumber?: string;
  public subtotal!: number;
  public taxAmount!: number;
  public grandTotal!: number;
  public amountPaid!: number;
  public paymentMethod!: string;
  public orderNumber!: string;
  public status!: "pending" | "paid" | "cancelled";
  public cashierId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly items?: OrderItem[];

  public static associate() {
    // Satu Order dibuat oleh satu Kasir (User)
    Order.belongsTo(User, {
      foreignKey: "cashierId",
      as: "cashier",
    });
    // Satu Order memiliki banyak OrderItem
    Order.hasMany(OrderItem, {
      foreignKey: "orderId",
      as: "items",
    });
  }
}

export const initOrderModel = (sequelize: Sequelize) => {
  Order.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      orderType: {
        type: DataTypes.ENUM("dine-in", "take-away"),
        allowNull: false,
      },
      tableNumber: {
        type: DataTypes.STRING,
        allowNull: true, // Hanya wajib jika dine-in
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "paid", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      grandTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      cashierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Orders",
    }
  );
};
