import NotFoundError from "../errors/not-found.error";
import { Category } from "../models";

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
};
