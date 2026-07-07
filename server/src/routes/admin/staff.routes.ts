import { Router } from "express";
import * as staffController from "../../controllers/admin/staff.controller";

const router = Router();

router.get("/", staffController.list);
router.get("/:id", staffController.get);
router.post("/", staffController.create);
router.put("/:id", staffController.update);
router.delete("/:id", staffController.remove);

export default router;
