import { QueryInterface } from "sequelize";
import bcrypt from "bcrypt";

export default {
  up: async (queryInterface: QueryInterface) => {
    const hashedPasswordAdmin = await bcrypt.hash("password123", 10);
    const hashedPasswordKasir = await bcrypt.hash("password456", 10);

    return queryInterface.bulkInsert(
      "Users",
      [
        {
          username: "admin",
          email: "admin@padipos.com",
          password: hashedPasswordAdmin,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "kasir1",
          email: "kasir1@padipos.com",
          password: hashedPasswordKasir,
          role: "kasir",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {}, {});
  },
};
