import { Router } from "express";
import * as staffOrderController from "../../controllers/staff/order.controller";
import { authenticate, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, requireRole("STAFF", "ADMIN"));

router.get("/", staffOrderController.list);
router.get("/:id", staffOrderController.get);
router.patch("/:id/status", staffOrderController.updateStatus);

export default router;
