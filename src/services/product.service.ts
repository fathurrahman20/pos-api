import NotFoundError from "../errors/not-found.error";
import { Category, Product, sequelize } from "../models";
import { v2 as cloudinary } from "cloudinary";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "../schema/product.schema";
import { WhereOptions } from "sequelize";
import { Op } from "sequelize";

export const productServices = {
  async getAllProducts(
    page: number,
    limit: number,
    categoryId?: string,
    q?: string
  ) {
    const offset = (page - 1) * limit;
    const where: WhereOptions<Product> = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (q) {
      // iLike untuk case insensitive
      where.name = {
        [Op.iLike]: `%${q}%`,
      };
    }
    const { count, rows } = await Product.findAndCountAll({
      where,
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
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      totalItems: count,
      totalPages,
      currentPage: page,
    };
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

  async createProduct(data: CreateProductSchema, image: string | undefined) {
    const { name, description, price, categoryId } = data;
    const transaction = await sequelize.transaction();

    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    let productImage: string | null = null;
    let productImageId: string | null = null;

    if (image) {
      const { public_id, url } = await cloudinary.uploader.upload(image, {
        folder: "pos",
        // width: 1920,
        // height: 1080,
        // crop: "fill",
      });
      productImage = url;
      productImageId = public_id;
    }

    const createdProduct = await Product.create(
      {
        name,
        description,
        price,
        categoryId,
        image: productImage,
        imageId: productImageId,
      },
      { transaction }
    );

    const newProduct = await Product.findByPk(createdProduct.id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      attributes: {
        exclude: ["imageId", "categoryId", "createdAt", "updatedAt"],
      },
      transaction,
    });

    await transaction.commit();

    return newProduct;
  },

  async updateProduct(
    id: number,
    data: UpdateProductSchema,
    image: string | undefined
  ) {
    const { name, description, price, categoryId } = data;
    const transaction = await sequelize.transaction();

    const product = await Product.findByPk(id, {
      attributes: {
        exclude: ["categoryId", "createdAt", "updatedAt"],
      },
    });

    if (!product) {
      await transaction.rollback();
      throw new NotFoundError("Product not found");
    }

    let productImage: string | undefined = product.image;
    let productImageId: string | undefined = product.imageId;

    if (image) {
      if (product.imageId) {
        await cloudinary.uploader.destroy(
          product.imageId || "",
          (result) => result
        );
      }

      const { public_id, url } = await cloudinary.uploader.upload(image, {
        folder: "pos",
      });
      productImage = url;
      productImageId = public_id;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.categoryId = categoryId || product.categoryId;
    product.image = productImage;
    product.imageId = productImageId;

    await product.save();
    await transaction.commit();

    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      attributes: {
        exclude: ["imageId", "categoryId", "createdAt", "updatedAt"],
      },
    });

    return updatedProduct;
  },

  async deleteProduct(id: number) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    if (product.imageId) {
      await cloudinary.uploader.destroy(product.imageId, (result) => result);
    }

    await product.destroy();
    return true;
  },
};
