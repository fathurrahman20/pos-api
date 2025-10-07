export default {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: { ssl: { require: true } },
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: { ssl: { require: true } },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: { ssl: { require: true } },
  },
};
