import { Model, DataTypes, Sequelize } from "sequelize";
import { Category } from "./category";
import { OrderItem } from "./orderitem";

export class Product extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public categoryId!: number;
  public image?: string;
  public imageId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly category?: Category;

  public static associate() {
    // Satu Produk milik satu Kategori
    Product.belongsTo(Category, {
      foreignKey: "categoryId",
      as: "category",
    });

    Product.hasMany(OrderItem, {
      foreignKey: "productId",
      as: "items",
    });
  }
}

export const initProductModel = (sequelize: Sequelize) => {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imageId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
    }
  );
};
