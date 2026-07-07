import { Router } from "express";
import * as orderController from "../../controllers/customer/order.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", orderController.create);
router.get("/me", orderController.listMine);
router.get("/:id", orderController.get);

export default router;
