import { FaqAnswersService } from "@services/faq-answers.service";
import type { AnswerStatus } from "@app-types/faq";
import type { Context } from "hono";

const service = new FaqAnswersService();

export const getFaqAnswersHandler = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;
  const filters = {
    question_id: c.req.query("question_id"),
    campus_id: c.req.query("campus_id"),
    status: c.req.query("status"),
  };
  return c.json(await service.findAll(filters, limit, offset), 200);
};

export const getFaqAnswersByQuestionHandler = async (c: Context) => {
  const questionId = c.req.param("questionId")!;
  const campusId = c.req.query("campus_id");
  return c.json(await service.findByQuestion(questionId, campusId), 200);
};

export const getFaqAnswerHandler = async (c: Context) => {
  const a = await service.findById(c.req.param("id")!);
  if (!a) return c.json({ error: "NOT_FOUND", message: "FAQ answer not found" }, 404);
  return c.json({ data: a }, 200);
};

export const createFaqAnswerHandler = async (c: Context) => {
  const raw = await c.req.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { campus_ids, ...data } = raw;
  const user = c.get("user");
  const a = await service.create(data, user?.id);
  return c.json({ data: a }, 201);
};

export const updateFaqAnswerHandler = async (c: Context) => {
  const data = await c.req.json();
  const a = await service.update(c.req.param("id")!, data);
  return c.json({ data: a }, 200);
};

export const setFaqAnswerCampusesHandler = async (c: Context) => {
  const { campus_ids } = await c.req.json();
  const a = await service.setCampuses(c.req.param("id")!, campus_ids ?? []);
  return c.json({ data: a }, 200);
};

export const transitionFaqAnswerStatusHandler = async (c: Context) => {
  const { status, rejection_reason } = await c.req.json();
  const user = c.get("user");
  const a = await service.transitionStatus(c.req.param("id")!, status as AnswerStatus, user?.id, rejection_reason);
  return c.json({ data: a }, 200);
};

export const approvePendingFaqAnswersHandler = async (c: Context) => {
  const user = c.get("user");
  const result = await service.approvePending(user?.id);
  return c.json(
    {
      message: `Approved ${result.approved_count} pending FAQ answer(s)`,
      approved_count: result.approved_count,
    },
    200
  );
};

export const deleteFaqAnswerHandler = async (c: Context) => {
  await service.delete(c.req.param("id")!);
  return c.json({ message: "FAQ answer deleted successfully" }, 200);
};

export const searchFaqHandler = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;
  const filters = {
    topic_id: c.req.query("topic_id"),
    sub_topic_id: c.req.query("sub_topic_id"),
    campus_id: c.req.query("campus_id"),
    keyword: c.req.query("keyword"),
    status: c.req.query("status") ?? "approved",
  };
  return c.json(await service.search(filters, limit, offset), 200);
};
