import { Request, Response } from "express";
import { categoriesServices } from "../services/category.service";
import { getCategorySchema } from "../schema/category.schema";
import BadRequestError from "../errors/bad-request.error";

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await categoriesServices.getAllCategories();

  res.status(200).json({
    success: true,
    message: "Successfully get all categories",
    data: categories,
  });
};

export const getCategory = async (req: Request, res: Response) => {
  const id = getCategorySchema.parse(Number(req.params.id)) as number;

  if (typeof id !== "number" || isNaN(id)) {
    throw new BadRequestError("ID must be a number.");
  }

  const category = await categoriesServices.getCategoryById(id);

  res.status(200).json({
    success: true,
    message: "Successfully get category",
    data: category,
  });
};
