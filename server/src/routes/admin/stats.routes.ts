import { Router } from "express";
import * as statsController from "../../controllers/admin/stats.controller";

const router = Router();

router.get("/", statsController.get);

export default router;
