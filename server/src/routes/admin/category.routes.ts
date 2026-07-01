import { Router } from "express";
import * as categoryController from "../../controllers/admin/category.controller";

const router = Router();

router.get("/", categoryController.list);
router.get("/:id", categoryController.get);
router.post("/", categoryController.create);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.remove);

export default router;
