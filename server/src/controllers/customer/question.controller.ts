import { Request, Response, NextFunction } from "express";
import * as questionService from "../../services/question.service";
import { HttpError } from "../../utils/http-error";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content } = req.body;
    if (!title || !content) throw new HttpError(400, "제목과 내용을 입력해주세요.");
    const question = await questionService.createQuestion(req.user!.sub, { title, content });
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction) {
  try {
    const questions = await questionService.listQuestionsByUser(req.user!.sub);
    res.json(questions);
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const question = await questionService.getQuestionForUser(Number(req.params.id), req.user!.sub);
    if (!question) throw new HttpError(404, "문의를 찾을 수 없습니다.");
    res.json(question);
  } catch (err) {
    next(err);
  }
}
