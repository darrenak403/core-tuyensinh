import { FaqCollectionsService } from "@services/faq-collections.service";
import type { CollectionStatus } from "@app-types/faq";
import type { Context } from "hono";

const service = new FaqCollectionsService();

export const getFaqCollectionsHandler = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;
  const year = c.req.query("admission_year") ? Number(c.req.query("admission_year")) : undefined;
  const filters = {
    status: c.req.query("status"),
    admission_year: year,
    campus_id: c.req.query("campus_id"),
  };
  return c.json(await service.findAll(filters, limit, offset), 200);
};

export const getFaqCollectionHandler = async (c: Context) => {
  const col = await service.findById(c.req.param("id")!);
  if (!col) return c.json({ error: "NOT_FOUND", message: "FAQ collection not found" }, 404);
  return c.json({ data: col }, 200);
};

export const createFaqCollectionHandler = async (c: Context) => {
  const data = await c.req.json();
  const col = await service.create(data);
  return c.json({ data: col }, 201);
};

export const updateFaqCollectionHandler = async (c: Context) => {
  const data = await c.req.json();
  const col = await service.update(c.req.param("id")!, data);
  return c.json({ data: col }, 200);
};

export const transitionFaqCollectionStatusHandler = async (c: Context) => {
  const { status } = await c.req.json();
  const user = c.get("user");
  const col = await service.transitionStatus(c.req.param("id")!, status as CollectionStatus, user?.id);
  return c.json({ data: col }, 200);
};

export const addFaqCollectionItemsHandler = async (c: Context) => {
  const { answer_ids } = await c.req.json();
  const inserted = await service.addItems(c.req.param("id")!, answer_ids ?? []);
  return c.json({ message: `Added ${inserted} answer(s) to collection`, inserted }, 200);
};

export const removeFaqCollectionItemHandler = async (c: Context) => {
  await service.removeItem(c.req.param("id")!, c.req.param("answerId")!);
  return c.json({ message: "Answer removed from collection" }, 200);
};

export const deleteFaqCollectionHandler = async (c: Context) => {
  await service.delete(c.req.param("id")!);
  return c.json({ message: "FAQ collection deleted successfully" }, 200);
};
