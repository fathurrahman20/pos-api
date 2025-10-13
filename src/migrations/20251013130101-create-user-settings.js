"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserSettings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "English",
      },
      preferenceMode: {
        type: Sequelize.ENUM("light", "dark"),
        allowNull: false,
        defaultValue: "light",
      },
      fontSize: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 16,
      },
      zoomDisplay: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserSettings");
  },
};
