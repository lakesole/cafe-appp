import { Request, Response, NextFunction } from "express";
import * as questionService from "../../services/question.service";
import { HttpError } from "../../utils/http-error";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const questions = await questionService.listAllQuestions();
    res.json(questions);
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const question = await questionService.getQuestion(Number(req.params.id));
    if (!question) throw new HttpError(404, "문의를 찾을 수 없습니다.");
    res.json(question);
  } catch (err) {
    next(err);
  }
}

export async function answer(req: Request, res: Response, next: NextFunction) {
  try {
    const { answer } = req.body;
    if (!answer) throw new HttpError(400, "답변 내용을 입력해주세요.");
    const question = await questionService.answerQuestion(Number(req.params.id), answer);
    res.json(question);
  } catch (err) {
    next(err);
  }
}
