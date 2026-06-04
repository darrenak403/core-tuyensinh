import { db } from "@config/database";
import type { CreateFaqTopicRequest, FaqTopicPublic, UpdateFaqTopicRequest } from "@app-types/faq";
import { z } from "zod";
import { BaseService, type PaginatedResponse, commonSchemas } from "./base.service";

export class FaqTopicsService extends BaseService<FaqTopicPublic, CreateFaqTopicRequest, UpdateFaqTopicRequest> {
  protected readonly tableName = "faq_topics";

  protected readonly publicSchema = z.object({
    id: commonSchemas.uuid,
    code: z.string(),
    name: z.string(),
    description: commonSchemas.optionalString,
    sort_order: z.number(),
    is_active: z.boolean(),
  });

  protected readonly createSchema = z.object({
    code: z.string(),
    name: z.string(),
    description: z.string().optional(),
    sort_order: z.number().optional(),
  });

  protected readonly updateSchema = z.object({
    code: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    sort_order: z.number().optional(),
    is_active: z.boolean().optional(),
  });

  async findAll(limit = 50, offset = 0): Promise<PaginatedResponse<FaqTopicPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`SELECT * FROM get_faq_topics_with_pagination(${limit}, ${offset})`,
      db`SELECT get_faq_topics_count() AS total`,
    ]);
    return this.createPaginatedResponse(this.parseMany(dataRows), this.extractTotal(countRows), limit, offset);
  }

  async findById(id: string): Promise<FaqTopicPublic | null> {
    const [row] = await db`SELECT * FROM get_faq_topic_by_id(${id})`;
    return row ? this.parseOne(row) : null;
  }

  async create(data: CreateFaqTopicRequest): Promise<FaqTopicPublic> {
    const [row] = await db`
      SELECT * FROM create_faq_topic(
        ${data.code},
        ${data.name},
        ${data.description ?? null},
        ${data.sort_order ?? 0}
      )
    `;
    return this.parseOne(row);
  }

  async update(id: string, data: UpdateFaqTopicRequest): Promise<FaqTopicPublic> {
    const [row] = await db`
      SELECT * FROM update_faq_topic(
        ${id},
        ${data.code ?? null},
        ${data.name ?? null},
        ${data.description ?? null},
        ${data.sort_order ?? null},
        ${data.is_active ?? null}
      )
    `;
    return this.parseOne(row);
  }

  async delete(id: string): Promise<void> {
    await db`SELECT delete_faq_topic(${id})`;
  }
}
