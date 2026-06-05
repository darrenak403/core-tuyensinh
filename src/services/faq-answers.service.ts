import { db } from "@config/database";
import type {
  AnswerStatus,
  CreateFaqAnswerRequest,
  FaqAnswerPublic,
  FaqSearchResult,
  UpdateFaqAnswerRequest,
} from "@app-types/faq";
import { createFaqAnswerSchema, updateFaqAnswerSchema } from "@schemas/faq";
import { z } from "zod";
import { BaseService, type PaginatedResponse, commonSchemas } from "./base.service";

const pgArrayField = z.preprocess(parsePgArray, z.array(z.string()));

const answerPublicSchema = z.object({
  id: commonSchemas.uuid,
  question_id: commonSchemas.uuid,
  content: z.string(),
  status: z.string(),
  tags: pgArrayField,
  keywords: pgArrayField,
  synonyms: pgArrayField,
  campus_ids: pgArrayField,
  applies_to_all_campuses: z.boolean(),
  created_by: z.string().uuid().nullable().optional(),
  approved_by: z.string().uuid().nullable().optional(),
  approved_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejected_by: z.string().uuid().nullable().optional(),
  rejected_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejection_reason: commonSchemas.optionalString,
  version: z.number(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
});

function toPgTextArray(arr: string[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  const escaped = arr.map((s) => '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"').join(',');
  return `{${escaped}}`;
}

function toPgUuidArray(arr: string[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  return `{${arr.join(',')}}`;
}

function parsePgArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val !== 'string' || !val || val === '{}') return [];
  return val
    .replace(/^{|}$/g, '')
    .split(',')
    .map((s) => s.trim().replace(/^"|"$/g, ''));
}

export class FaqAnswersService extends BaseService<FaqAnswerPublic, CreateFaqAnswerRequest, UpdateFaqAnswerRequest> {
  protected readonly tableName = "faq_answers";
  protected readonly publicSchema = answerPublicSchema as z.ZodType<FaqAnswerPublic, any, any>;
  protected readonly createSchema = createFaqAnswerSchema as z.ZodType<CreateFaqAnswerRequest, any, any>;
  protected readonly updateSchema = updateFaqAnswerSchema as z.ZodType<UpdateFaqAnswerRequest, any, any>;

  async findAll(
    filters: { question_id?: string; campus_id?: string; status?: string },
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<FaqAnswerPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`SELECT * FROM get_faq_answers_with_pagination(
          ${filters.question_id ?? null},
          ${filters.campus_id ?? null},
          ${filters.status ?? null},
          ${limit},
          ${offset}
        )`,
      db`SELECT get_faq_answers_count(
          ${filters.question_id ?? null},
          ${filters.campus_id ?? null},
          ${filters.status ?? null}
        ) AS total`,
    ]);
    return this.createPaginatedResponse(this.parseMany(dataRows), this.extractTotal(countRows), limit, offset);
  }

  async findByQuestion(questionId: string, campusId?: string): Promise<PaginatedResponse<FaqAnswerPublic>> {
    return this.findAll({ question_id: questionId, campus_id: campusId, status: "approved" });
  }

  async findById(id: string): Promise<FaqAnswerPublic | null> {
    const [row] = await db`SELECT * FROM get_faq_answer_by_id(${id})`;
    return row ? this.parseOne(row) : null;
  }

  async create(data: CreateFaqAnswerRequest, userId?: string): Promise<FaqAnswerPublic> {
    const [row] = await db`
      SELECT * FROM create_faq_answer(
        ${data.question_id},
        ${data.content},
        ${toPgTextArray(data.tags)}::text[],
        ${toPgTextArray(data.keywords)}::text[],
        ${toPgTextArray(data.synonyms)}::text[],
        ${userId ?? null}
      )
    `;
    return this.parseOne(row);
  }

  async update(id: string, data: UpdateFaqAnswerRequest): Promise<FaqAnswerPublic> {
    const [row] = await db`
      SELECT * FROM update_faq_answer(
        ${id},
        ${data.content ?? null},
        ${toPgTextArray(data.tags)}::text[],
        ${toPgTextArray(data.keywords)}::text[],
        ${toPgTextArray(data.synonyms)}::text[]
      )
    `;
    return this.parseOne(row);
  }

  async setCampuses(answerId: string, campusIds: string[]): Promise<FaqAnswerPublic> {
    const [row] = await db`SELECT * FROM set_faq_answer_campuses(${answerId}, ${toPgUuidArray(campusIds)}::uuid[])`;
    return this.parseOne(row);
  }

  async transitionStatus(
    id: string,
    newStatus: AnswerStatus,
    userId?: string,
    rejectionReason?: string
  ): Promise<FaqAnswerPublic> {
    const [row] = await db`
      SELECT * FROM transition_faq_answer_status(
        ${id},
        ${newStatus},
        ${userId ?? null},
        ${rejectionReason ?? null}
      )
    `;
    return this.parseOne(row);
  }

  async delete(id: string): Promise<void> {
    await db`SELECT delete_faq_answer(${id})`;
  }

  async search(
    filters: {
      topic_id?: string;
      sub_topic_id?: string;
      campus_id?: string;
      keyword?: string;
      status?: string;
    },
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<FaqSearchResult>> {
    const searchSchema = z.object({
      answer_id: z.string().uuid(),
      question_id: z.string().uuid(),
      question_content: z.string(),
      question_status: z.string(),
      sub_topic_id: z.string().uuid(),
      sub_topic_name: z.string(),
      topic_id: z.string().uuid(),
      topic_name: z.string(),
      answer_content: z.string(),
      answer_status: z.string(),
      campus_ids: pgArrayField,
      applies_to_all_campuses: z.boolean(),
      tags: pgArrayField,
      keywords: pgArrayField,
      synonyms: pgArrayField,
    });

    const [dataRows, countRows] = await Promise.all([
      db`SELECT * FROM search_faq(
          ${filters.topic_id ?? null},
          ${filters.sub_topic_id ?? null},
          ${filters.campus_id ?? null},
          ${filters.keyword ?? null},
          ${filters.status ?? "approved"},
          ${limit},
          ${offset}
        )`,
      db`SELECT search_faq_count(
          ${filters.topic_id ?? null},
          ${filters.sub_topic_id ?? null},
          ${filters.campus_id ?? null},
          ${filters.keyword ?? null},
          ${filters.status ?? "approved"}
        ) AS total`,
    ]);

    const data = z.array(searchSchema).parse(dataRows) as FaqSearchResult[];
    const total = this.extractTotal(countRows);
    return this.createPaginatedResponse(data, total, limit, offset);
  }
}
