import NotFoundError from "../errors/not-found.error";
import { Category, Product } from "../models";

export const productServices = {
  async getAllProducts(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const products = await Product.findAll({
      offset,
      limit,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      attributes: {
        exclude: ["categoryId", "imageId", "createdAt", "updatedAt"],
      },
    });
    return products;
  },

  async getProductById(id: number) {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      attributes: {
        exclude: ["categoryId", "imageId", "createdAt", "updatedAt"],
      },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return product;
  },
};
