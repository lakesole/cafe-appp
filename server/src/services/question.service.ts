import { prisma } from "../prisma";

export function createQuestion(userId: number, data: { title: string; content: string }) {
  return prisma.question.create({ data: { userId, title: data.title, content: data.content } });
}

export function listQuestionsByUser(userId: number) {
  return prisma.question.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export function getQuestionForUser(id: number, userId: number) {
  return prisma.question.findFirst({ where: { id, userId } });
}

export function listAllQuestions() {
  return prisma.question.findMany({
    include: { user: { select: { name: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getQuestion(id: number) {
  return prisma.question.findUnique({
    where: { id },
    include: { user: { select: { name: true, username: true } } },
  });
}

export function answerQuestion(id: number, answer: string) {
  return prisma.question.update({
    where: { id },
    data: { answer, answeredAt: new Date() },
    include: { user: { select: { name: true, username: true } } },
  });
}
