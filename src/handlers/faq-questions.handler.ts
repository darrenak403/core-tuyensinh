import type { QuestionStatus } from "@app-types/faq";
import { FaqQuestionsService } from "@services/faq-questions.service";
import type { Context } from "hono";

const service = new FaqQuestionsService();

export const getFaqQuestionsHandler = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;
  const filters = {
    sub_topic_id: c.req.query("sub_topic_id"),
    topic_id: c.req.query("topic_id"),
    status: c.req.query("status") as QuestionStatus | undefined,
    content: c.req.query("content"),
    code: c.req.query("code"),
  };
  return c.json(await service.findAll(filters, limit, offset), 200);
};

export const getFaqQuestionHandler = async (c: Context) => {
  const q = await service.findById(c.req.param("id"));
  if (!q)
    return c.json(
      { error: "NOT_FOUND", message: "FAQ question not found" },
      404
    );
  return c.json({ data: q }, 200);
};

export const createFaqQuestionHandler = async (c: Context) => {
  const data = await c.req.json();
  const user = c.get("user");
  const q = await service.create(data, user?.id);
  return c.json({ data: q }, 201);
};

export const quickAddFaqQuestionsHandler = async (c: Context) => {
  try {
    const data = await c.req.json();
    const user = c.get("user");
    const result = await service.quickAdd(data, user?.id);
    const answerCount = result.reduce(
      (total, item) => total + item.answers.length,
      0
    );
    return c.json(
      {
        data: result,
        meta: {
          question_count: result.length,
          answer_count: answerCount,
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("not found")) {
        return c.json({ error: "NOT_FOUND", message: error.message }, 404);
      }

      if (
        error.message.startsWith("Raw FAQ text") ||
        error.message.startsWith("At least one question")
      ) {
        return c.json(
          { error: "VALIDATION_ERROR", message: error.message },
          400
        );
      }
    }

    throw error;
  }
};

export const updateFaqQuestionHandler = async (c: Context) => {
  const data = await c.req.json();
  const q = await service.update(c.req.param("id"), data);
  return c.json({ data: q }, 200);
};

export const transitionFaqQuestionStatusHandler = async (c: Context) => {
  const { status, rejection_reason } = await c.req.json();
  const user = c.get("user");
  const q = await service.transitionStatus(
    c.req.param("id"),
    status as QuestionStatus,
    user?.id,
    rejection_reason
  );
  return c.json({ data: q }, 200);
};

export const approvePendingFaqQuestionsHandler = async (c: Context) => {
  const user = c.get("user");
  const result = await service.approvePending(user?.id);
  return c.json(
    {
      message: `Approved ${result.approved_count} pending FAQ question(s)`,
      approved_count: result.approved_count,
    },
    200
  );
};

export const deleteFaqQuestionHandler = async (c: Context) => {
  await service.delete(c.req.param("id"));
  return c.json({ message: "FAQ question deleted successfully" }, 200);
};
