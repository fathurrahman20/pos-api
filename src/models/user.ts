import { Model, DataTypes, Sequelize } from "sequelize";
import { Order } from "./order";
import { UserSettings } from "./user-setting";

export class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: "admin" | "kasir";
  public image?: string;
  public imageId?: string;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;
  public status?: "active" | "inactive";

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly settings?: UserSettings;

  public static associate() {
    // Seorang Kasir (User) bisa memiliki banyak Order
    User.hasMany(Order, {
      foreignKey: "cashierId",
      as: "orders",
    });

    // Satu User punya satu UserSettings
    User.hasOne(UserSettings, {
      foreignKey: "userId",
      as: "settings",
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
      status: {
        type: DataTypes.ENUM("active", "inactive"),
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
