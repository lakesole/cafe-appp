import { Router } from "express";
import * as categoryController from "../../controllers/customer/category.controller";

const router = Router();

router.get("/", categoryController.list);

export default router;
