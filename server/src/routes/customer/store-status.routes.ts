import { Router } from "express";
import * as storeStatusController from "../../controllers/customer/store-status.controller";

const router = Router();

router.get("/", storeStatusController.get);

export default router;
