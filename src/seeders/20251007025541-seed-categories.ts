import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Categories", // Nama tabel di database
      [
        {
          name: "Foods",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Beverages",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dessert",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Snacks",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Drinks",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Categories", {}, {});
  },
};
