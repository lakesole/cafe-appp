import { Router } from "express";
import * as storeStatusController from "../../controllers/admin/store-status.controller";

const router = Router();

router.get("/", storeStatusController.get);
router.patch("/", storeStatusController.update);

export default router;
