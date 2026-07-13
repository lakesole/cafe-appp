import { Router } from "express";
import * as questionController from "../../controllers/customer/question.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", questionController.create);
router.get("/me", questionController.listMine);
router.get("/:id", questionController.get);

export default router;
