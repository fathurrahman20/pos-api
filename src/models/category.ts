import { Model, DataTypes, Sequelize } from "sequelize";
import { Product } from "./product";

export class Category extends Model {
  public id!: number;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    // Satu Kategori punya banyak Produk
    Category.hasMany(Product, {
      foreignKey: "categoryId",
      as: "products",
    });
  }
}

export const initCategoryModel = (sequelize: Sequelize) => {
  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories",
    }
  );
};
