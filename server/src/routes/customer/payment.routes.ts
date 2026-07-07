import { Router } from "express";
import * as orderController from "../../controllers/customer/order.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/mock", authenticate, orderController.payMock);

export default router;
