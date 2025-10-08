import ConflictError from "../errors/conflict.error";
import NotFoundError from "../errors/not-found.error";
import { Category, sequelize } from "../models";
import {
  CreateCategoryData,
  UpdateCategoryData,
} from "../schema/category.schema";

export const categoriesServices = {
  async getAllCategories() {
    const categories = await Category.findAll({
      attributes: ["id", "name"],
    });

    return categories;
  },

  async getCategoryById(categoryId: number) {
    const category = await Category.findByPk(categoryId, {
      attributes: ["id", "name"],
    });

    if (!category) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    return category;
  },

  async createCategory(data: CreateCategoryData) {
    const { name: categoryName } = data;
    const transaction = await sequelize.transaction();

    const existingCategory = await Category.findOne({
      where: { name: categoryName },
      transaction,
    });

    if (existingCategory) {
      await transaction.rollback();
      throw new ConflictError("Kategori sudah ada");
    }

    const fullNewCategory = await Category.create(
      {
        name: categoryName,
      },
      {
        returning: ["id", "name"],
        transaction,
      }
    );

    const { id, name } = fullNewCategory.get({ plain: true });

    const newCategory = { id, name };

    await transaction.commit();

    return newCategory;
  },

  async updateCategory(id: number, data: UpdateCategoryData) {
    const { name: categoryName } = data;

    const category = await Category.findByPk(id, {
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!category) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    const existingCategory = await Category.findOne({
      where: { name: categoryName },
    });

    if (existingCategory) {
      throw new ConflictError("Kategori sudah ada");
    }

    category.name = categoryName || category.name;
    await category.save();

    const updatedCategory = {
      id: category.id,
      name: category.name,
    };

    return updatedCategory;
  },

  async deleteCategory(id: number) {
    const category = await Category.findByPk(id);

    if (!category) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    await category.destroy();

    return true;
  },
};
