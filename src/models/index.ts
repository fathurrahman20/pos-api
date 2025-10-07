import { Sequelize } from "sequelize";
import { initUserModel, User } from "./user";
import { initCategoryModel, Category } from "./category";
import { initProductModel, Product } from "./product";
import { initOrderModel, Order } from "./order";
import { initOrderItemModel, OrderItem } from "./orderitem";
import { config } from "dotenv";

const env = process.env.NODE_ENV || "development";
// const config = require(__dirname + "/../config/config.ts")[env];

config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}

const sequelize = new Sequelize(dbUrl, {
  dialectOptions: {
    ssl: {
      require: true,
    },
  },
});

// Init semua model
initUserModel(sequelize);
initCategoryModel(sequelize);
initProductModel(sequelize);
initOrderModel(sequelize);
initOrderItemModel(sequelize);

// Call method associate untuk membuat relasi
User.associate();
Category.associate();
Product.associate();
Order.associate();
OrderItem.associate();

export { sequelize, User, Category, Product, Order, OrderItem };
