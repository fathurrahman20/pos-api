import { Request, Response } from "express";
import { productServices } from "../services/product.service";
import BadRequestError from "../errors/bad-request.error";

export const getAllProducts = async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const pageAsNumber = page ? parseInt(page as string) : 1;
  const limitAsNumber = limit ? parseInt(limit as string) : 20;

  const products = await productServices.getAllProducts(
    pageAsNumber,
    limitAsNumber
  );

  res.status(200).json({
    success: true,
    message: "Successfully get all products",
    data: products,
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
