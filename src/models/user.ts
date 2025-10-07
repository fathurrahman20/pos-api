import { Model, DataTypes, Sequelize } from "sequelize";
import { Order } from "./order";

export class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: "admin" | "kasir";
  public image?: string;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    // Seorang Kasir (User) bisa memiliki banyak Order
    User.hasMany(Order, {
      foreignKey: "cashierId",
      as: "orders",
    });
  }
}

export const initUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "kasir"),
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    }
  );
};
