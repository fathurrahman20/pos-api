// models/userSetting.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import { User } from "./user";

export class UserSettings extends Model {
  public id!: number;
  public userId!: number;
  public language!: string;
  public preferenceMode!: "light" | "dark";
  public fontSize!: number;
  public zoomDisplay!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    // Satu UserSettings milik satu User
    UserSettings.belongsTo(User, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

export const initUserSettingsModel = (sequelize: Sequelize) => {
  UserSettings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Nama tabel
          key: "id",
        },
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: "English",
        allowNull: false,
      },
      preferenceMode: {
        type: DataTypes.ENUM("light", "dark"),
        defaultValue: "light",
        allowNull: false,
      },
      fontSize: {
        type: DataTypes.INTEGER,
        defaultValue: 16,
        allowNull: false,
      },
      zoomDisplay: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserSettings",
      tableName: "UserSettings",
    }
  );
};
