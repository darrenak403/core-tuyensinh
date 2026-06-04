import { FaqTopicsService } from "@services/faq-topics.service";
import type { Context } from "hono";

const service = new FaqTopicsService();

export const getFaqTopicsHandler = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;
  return c.json(await service.findAll(limit, offset), 200);
};

export const getFaqTopicHandler = async (c: Context) => {
  const topic = await service.findById(c.req.param("id")!);
  if (!topic) return c.json({ error: "NOT_FOUND", message: "FAQ topic not found" }, 404);
  return c.json({ data: topic }, 200);
};

export const createFaqTopicHandler = async (c: Context) => {
  const data = await c.req.json();
  const topic = await service.create(data);
  return c.json({ data: topic }, 201);
};

export const updateFaqTopicHandler = async (c: Context) => {
  const data = await c.req.json();
  const topic = await service.update(c.req.param("id")!, data);
  return c.json({ data: topic }, 200);
};

export const deleteFaqTopicHandler = async (c: Context) => {
  await service.delete(c.req.param("id")!);
  return c.json({ message: "FAQ topic deleted successfully" }, 200);
};
