import { Router } from "express";
import * as questionController from "../../controllers/admin/question.controller";

const router = Router();

router.get("/", questionController.list);
router.get("/:id", questionController.get);
router.patch("/:id/answer", questionController.answer);

export default router;
