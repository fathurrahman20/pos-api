import { Model, DataTypes, Sequelize } from "sequelize";
import { Order } from "./order";
import { Product } from "./product";

export class OrderItem extends Model {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number; // Harga per item saat transaksi
  public notes?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    // Satu OrderItem terhubung ke satu Order
    OrderItem.belongsTo(Order, {
      foreignKey: "orderId",
      as: "order",
    });
    // Satu OrderItem terhubung ke satu Product
    OrderItem.belongsTo(Product, {
      foreignKey: "productId",
      as: "product",
    });
  }
}

export const initOrderItemModel = (sequelize: Sequelize) => {
  OrderItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "OrderItems",
    }
  );
};
