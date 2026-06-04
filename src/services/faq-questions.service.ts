import { db } from "@config/database";
import type {
  CreateFaqQuestionRequest,
  FaqQuestionPublic,
  QuestionStatus,
  UpdateFaqQuestionRequest,
} from "@app-types/faq";
import { z } from "zod";
import { BaseService, type PaginatedResponse, commonSchemas } from "./base.service";

const questionPublicSchema = z.object({
  id: commonSchemas.uuid,
  sub_topic_id: commonSchemas.uuid,
  content: z.string(),
  status: z.string(),
  created_by: z.string().uuid().nullable().optional(),
  approved_by: z.string().uuid().nullable().optional(),
  approved_at: z.union([z.string(), z.date()]).nullable().optional(),
  published_by: z.string().uuid().nullable().optional(),
  published_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejected_by: z.string().uuid().nullable().optional(),
  rejected_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejection_reason: commonSchemas.optionalString,
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
});

export class FaqQuestionsService extends BaseService<FaqQuestionPublic, CreateFaqQuestionRequest, UpdateFaqQuestionRequest> {
  protected readonly tableName = "faq_questions";
  protected readonly publicSchema = questionPublicSchema as z.ZodType<FaqQuestionPublic, any, any>;
  protected readonly createSchema = z.object({ sub_topic_id: z.string(), content: z.string() });
  protected readonly updateSchema = z.object({ content: z.string().optional(), sub_topic_id: z.string().optional() });

  async findAll(
    filters: { sub_topic_id?: string; status?: string },
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<FaqQuestionPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`SELECT * FROM get_faq_questions_with_pagination(
          ${filters.sub_topic_id ?? null},
          ${filters.status ?? null},
          ${limit},
          ${offset}
        )`,
      db`SELECT get_faq_questions_count(${filters.sub_topic_id ?? null}, ${filters.status ?? null}) AS total`,
    ]);
    return this.createPaginatedResponse(this.parseMany(dataRows), this.extractTotal(countRows), limit, offset);
  }

  async findById(id: string): Promise<FaqQuestionPublic | null> {
    const [row] = await db`SELECT * FROM get_faq_question_by_id(${id})`;
    return row ? this.parseOne(row) : null;
  }

  async create(data: CreateFaqQuestionRequest, userId?: string): Promise<FaqQuestionPublic> {
    const [row] = await db`
      SELECT * FROM create_faq_question(${data.sub_topic_id}, ${data.content}, ${userId ?? null})
    `;
    return this.parseOne(row);
  }

  async update(id: string, data: UpdateFaqQuestionRequest): Promise<FaqQuestionPublic> {
    const [row] = await db`
      SELECT * FROM update_faq_question(${id}, ${data.content ?? null}, ${data.sub_topic_id ?? null})
    `;
    return this.parseOne(row);
  }

  async transitionStatus(
    id: string,
    newStatus: QuestionStatus,
    userId?: string,
    rejectionReason?: string
  ): Promise<FaqQuestionPublic> {
    const [row] = await db`
      SELECT * FROM transition_faq_question_status(
        ${id},
        ${newStatus},
        ${userId ?? null},
        ${rejectionReason ?? null}
      )
    `;
    return this.parseOne(row);
  }

  async delete(id: string): Promise<void> {
    await db`SELECT delete_faq_question(${id})`;
  }
}
