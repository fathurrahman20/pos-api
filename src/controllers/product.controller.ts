import { Request, RequestHandler, Response } from "express";
import { productServices } from "../services/product.service";
import BadRequestError from "../errors/bad-request.error";
import {
  createProductSchema,
  updateProductSchema,
} from "../schema/product.schema";

export const getAllProducts = async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const pageAsNumber = page ? parseInt(page as string) : 1;
  const limitAsNumber = limit ? parseInt(limit as string) : 10;

  const products = await productServices.getAllProducts(
    pageAsNumber,
    limitAsNumber
  );

  res.status(200).json({
    success: true,
    message: "Successfully get all products",
    data: products.data,
    meta: {
      totalItems: products.totalItems,
      totalPages: products.totalPages,
      currentPage: products.currentPage,
    },
  });
};

export const getProductById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (typeof id !== "number" || isNaN(id)) {
    throw new BadRequestError("ID must be a number.");
  }

  const product = await productServices.getProductById(id);

  res.status(200).json({
    success: true,
    message: "Successfully get product",
    data: product,
  });
};

export const createProduct: RequestHandler = async (
  req: Request,
  res: Response
) => {
  if (req.body.price && req.body.categoryId) {
    req.body.price = parseInt(req.body.price);
    req.body.categoryId = parseInt(req.body.categoryId);
  }

  const validatedData = createProductSchema.parse(req.body);

  const image = req.file?.path;

  const newProduct = await productServices.createProduct(validatedData, image);

  res.status(201).json({
    success: true,
    message: "Successfully create product",
    data: newProduct,
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (typeof id !== "number" || isNaN(id)) {
    throw new BadRequestError("ID must be a number.");
  }

  const requestBody = req.body;

  if (requestBody.price) {
    requestBody.price = parseInt(requestBody.price);
  }
  if (requestBody.categoryId) {
    requestBody.categoryId = parseInt(requestBody.categoryId);
  }

  // hapus field yang dikirim sebagai string kosong
  Object.keys(requestBody).forEach((key) => {
    if (requestBody[key] === "") {
      delete requestBody[key];
    }
  });

  const image = req.file?.path;

  const validatedData = updateProductSchema.parse(req.body);

  const updatedProduct = await productServices.updateProduct(
    id,
    validatedData,
    image
  );

  res.status(200).json({
    success: true,
    message: "Successfully update product",
    data: updatedProduct,
  });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (typeof id !== "number" || isNaN(id)) {
    throw new BadRequestError("ID must be a number.");
  }
  await productServices.deleteProduct(id);

  res.status(200).json({
    success: true,
    message: "Successfully delete product",
  });
};
