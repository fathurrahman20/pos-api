import { QueryInterface, Sequelize } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    // Map kategori ke ID mereka (asumsi urutan sesuai dengan seeder kategori)
    const categoryMap: { [key: string]: number } = {
      Foods: 1,
      Beverages: 2,
      Dessert: 3,
      Snacks: 4,
      Drinks: 5,
    };

    return queryInterface.bulkInsert(
      "Products", // Nama tabel di database
      [
        // Foods
        {
          name: "Nasi Goreng Spesial",
          description: "Nasi goreng dengan telur, ayam, dan udang.",
          price: 35000,
          categoryId: categoryMap["Foods"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Mie Ayam Bakso",
          description: "Mie ayam klasik dengan topping bakso sapi.",
          price: 25000,
          categoryId: categoryMap["Foods"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Beverages
        {
          name: "Es Teh Manis",
          description: "Minuman teh dingin yang menyegarkan.",
          price: 8000,
          categoryId: categoryMap["Beverages"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Jus Alpukat",
          description: "Jus buah alpukat segar dengan susu kental manis.",
          price: 18000,
          categoryId: categoryMap["Beverages"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Dessert
        {
          name: "Pancake Coklat",
          description: "Pancake lembut dengan saus coklat dan es krim vanilla.",
          price: 28000,
          categoryId: categoryMap["Dessert"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Brownies Kukus",
          description: "Brownies coklat lembut dengan taburan kacang.",
          price: 22000,
          categoryId: categoryMap["Dessert"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Snacks
        {
          name: "Kentang Goreng",
          description: "Kentang goreng renyah dengan saus sambal.",
          price: 15000,
          categoryId: categoryMap["Snacks"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Tahu Isi",
          description: "Tahu goreng isi sayuran dengan saus kacang.",
          price: 12000,
          categoryId: categoryMap["Snacks"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Drinks
        {
          name: "Kopi Hitam",
          description: "Kopi hitam pekat tanpa gula.",
          price: 10000,
          categoryId: categoryMap["Drinks"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Cappuccino",
          description: "Kopi dengan susu berbusa dan taburan coklat.",
          price: 20000,
          categoryId: categoryMap["Drinks"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Products", {}, {});
  },
};
