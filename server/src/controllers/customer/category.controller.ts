import { Request, Response } from "express";
import * as categoryService from "../../services/category.service";

export async function list(req: Request, res: Response) {
  const categories = await categoryService.listCategories();
  res.json(categories);
}
