import ConflictError from "../errors/conflict.error";
import NotFoundError from "../errors/not-found.error";
import { Category, sequelize } from "../models";
import {
  CreateCategoryData,
  UpdateCategoryData,
} from "../schema/category.schema";
import { redisClient } from "../utils/redis";

const CATEGORIES_CACHE_KEY = "categories:all";
const CATEGORY_CACHE_KEY = (id: number) => `category:${id}`;

export const categoriesServices = {
  async getAllCategories() {
    const cachedCategories = await redisClient.get(CATEGORIES_CACHE_KEY);
    if (typeof cachedCategories === "string") {
      return JSON.parse(cachedCategories);
    }

    const categories = await Category.findAll({
      attributes: ["id", "name"],
    });

    await redisClient.set(CATEGORIES_CACHE_KEY, JSON.stringify(categories), {
      ex: 3600,
    });

    return categories;
  },

  async getCategoryById(categoryId: number) {
    const cacheKey = CATEGORY_CACHE_KEY(categoryId);
    const cachedCategory = await redisClient.get(cacheKey);
    if (typeof cachedCategory === "string") {
      return JSON.parse(cachedCategory);
    }
    const category = await Category.findByPk(categoryId, {
      attributes: ["id", "name"],
    });

    if (!category) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    await redisClient.set(cacheKey, JSON.stringify(category), {
      ex: 3600,
    });

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
    await transaction.commit();

    const { id, name } = fullNewCategory.get({ plain: true });

    await redisClient.del(CATEGORIES_CACHE_KEY);

    const newCategory = { id, name };

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

    await redisClient.del(CATEGORIES_CACHE_KEY);
    await redisClient.del(CATEGORY_CACHE_KEY(id));

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

    await redisClient.del(CATEGORIES_CACHE_KEY);
    await redisClient.del(CATEGORY_CACHE_KEY(id));

    return true;
  },
};
