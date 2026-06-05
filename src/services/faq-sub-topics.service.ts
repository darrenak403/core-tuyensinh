import { db } from "@config/database";
import type { CreateFaqSubTopicRequest, FaqSubTopicPublic, UpdateFaqSubTopicRequest } from "@app-types/faq";
import { z } from "zod";
import { BaseService, type PaginatedResponse, commonSchemas } from "./base.service";

export class FaqSubTopicsService extends BaseService<FaqSubTopicPublic, CreateFaqSubTopicRequest, UpdateFaqSubTopicRequest> {
  protected readonly tableName = "faq_sub_topics";

  protected readonly publicSchema = z.object({
    id: commonSchemas.uuid,
    topic_id: commonSchemas.uuid,
    code: z.string(),
    name: z.string(),
    description: commonSchemas.optionalString,
    sort_order: z.number(),
    is_active: z.boolean(),
  });

  protected readonly createSchema = z.object({
    topic_id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    sort_order: z.number().optional(),
  });

  protected readonly updateSchema = z.object({
    topic_id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    sort_order: z.number().optional(),
    is_active: z.boolean().optional(),
  });

  async findAll(topicId?: string, limit = 50, offset = 0): Promise<PaginatedResponse<FaqSubTopicPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`SELECT * FROM get_faq_sub_topics_with_pagination(${topicId ?? null}, ${limit}, ${offset})`,
      db`SELECT get_faq_sub_topics_count(${topicId ?? null}) AS total`,
    ]);
    return this.createPaginatedResponse(this.parseMany(dataRows), this.extractTotal(countRows), limit, offset);
  }

  async findById(id: string): Promise<FaqSubTopicPublic | null> {
    const [row] = await db`SELECT * FROM get_faq_sub_topic_by_id(${id})`;
    return row ? this.parseOne(row) : null;
  }

  async create(data: CreateFaqSubTopicRequest): Promise<FaqSubTopicPublic> {
    const [row] = await db`
      SELECT * FROM create_faq_sub_topic(
        ${data.topic_id},
        ${data.name},
        ${data.description ?? null},
        ${data.sort_order ?? 0}
      )
    `;
    return this.parseOne(row);
  }

  async update(id: string, data: UpdateFaqSubTopicRequest): Promise<FaqSubTopicPublic> {
    const [row] = await db`
      SELECT * FROM update_faq_sub_topic(
        ${id},
        ${data.topic_id ?? null},
        ${data.name ?? null},
        ${data.description ?? null},
        ${data.sort_order ?? null},
        ${data.is_active ?? null}
      )
    `;
    return this.parseOne(row);
  }

  async delete(id: string): Promise<void> {
    await db`SELECT delete_faq_sub_topic(${id})`;
  }
}
