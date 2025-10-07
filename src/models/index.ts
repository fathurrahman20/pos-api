import { Sequelize } from "sequelize";
import { initUserModel, User } from "./user";
import { initCategoryModel, Category } from "./category";
import { initProductModel, Product } from "./product";
import { initOrderModel, Order } from "./order";
import { initOrderItemModel, OrderItem } from "./orderitem";

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

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
