import { Router } from "express";
import * as menuController from "../../controllers/customer/menu.controller";

const router = Router();

router.get("/", menuController.list);
router.get("/:id", menuController.get);

export default router;
