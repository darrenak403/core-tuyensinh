import { FaqSubTopicsService } from "@services/faq-sub-topics.service";
import type { Context } from "hono";

const service = new FaqSubTopicsService();

export const getFaqSubTopicsHandler = async (c: Context) => {
  const topicId = c.req.query("topic_id") || c.req.param("topicId");
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;
  return c.json(await service.findAll(topicId, limit, offset), 200);
};

export const getFaqSubTopicHandler = async (c: Context) => {
  const sub = await service.findById(c.req.param("id")!);
  if (!sub) return c.json({ error: "NOT_FOUND", message: "FAQ sub topic not found" }, 404);
  return c.json({ data: sub }, 200);
};

export const createFaqSubTopicHandler = async (c: Context) => {
  const data = await c.req.json();
  const sub = await service.create(data);
  return c.json({ data: sub }, 201);
};

export const updateFaqSubTopicHandler = async (c: Context) => {
  const data = await c.req.json();
  const sub = await service.update(c.req.param("id")!, data);
  return c.json({ data: sub }, 200);
};

export const deleteFaqSubTopicHandler = async (c: Context) => {
  await service.delete(c.req.param("id")!);
  return c.json({ message: "FAQ sub topic deleted successfully" }, 200);
};
