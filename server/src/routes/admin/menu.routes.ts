import { Router } from "express";
import * as menuController from "../../controllers/admin/menu.controller";

const router = Router();

router.get("/", menuController.list);
router.get("/:id", menuController.get);
router.post("/", menuController.create);
router.put("/:id", menuController.update);
router.delete("/:id", menuController.remove);

export default router;
