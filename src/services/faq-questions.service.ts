import { db } from "@config/database";
import type {
  FaqAnswerPublic,
  CreateFaqQuestionRequest,
  FaqQuestionPublic,
  FaqQuestionsQuery,
  QuickAddFaqQuestionsRequest,
  QuickAddFaqQuestionResult,
  QuestionStatus,
  UpdateFaqQuestionRequest,
} from "@app-types/faq";
import { z } from "zod";
import {
  BaseService,
  type PaginatedResponse,
  commonSchemas,
} from "./base.service";

const questionPublicSchema = z.object({
  id: commonSchemas.uuid,
  code: z.string(),
  sub_topic_id: commonSchemas.uuid,
  content: z.string(),
  status: z.string(),
  created_by: z.string().uuid().nullable().optional(),
  approved_by: z.string().uuid().nullable().optional(),
  approved_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejected_by: z.string().uuid().nullable().optional(),
  rejected_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejection_reason: commonSchemas.optionalString,
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
});

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
}) as z.ZodType<FaqAnswerPublic, any, any>;

type NormalizedQuickAddAnswer = {
  content: string;
  campus_ids?: string[];
  tags?: string[];
  keywords?: string[];
  synonyms?: string[];
};

type NormalizedQuickAddQuestion = {
  content: string;
  answers: NormalizedQuickAddAnswer[];
};

function toPgTextArray(arr: string[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  const escaped = arr
    .map((s) => '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"')
    .join(",");
  return `{${escaped}}`;
}

function toPgUuidArray(arr: string[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  return `{${arr.join(",")}}`;
}

function parsePgArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val !== "string" || !val || val === "{}") return [];
  return val
    .replace(/^{|}$/g, "")
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""));
}

function stripQuestionPrefix(content: string): string {
  return content.replace(/^\s*câu(?:\s*hỏi)?\s*\d+\s*[:：.)-]?\s*/i, "").trim();
}

function stripAnswerPrefix(content: string): string {
  return content.replace(/^\s*trả\s*lời\s*\d+\s*[:：.)-]?\s*/i, "").trim();
}

function parseQuickAddRawText(rawText: string): NormalizedQuickAddQuestion[] {
  const labelPattern =
    /(?:^|\n)\s*((?:câu(?:\s*hỏi)?|trả\s*lời)\s*\d+)\s*[:：.)-]?\s*/gi;
  const matches = [...rawText.matchAll(labelPattern)];
  const questions: NormalizedQuickAddQuestion[] = [];
  let currentQuestion: NormalizedQuickAddQuestion | null = null;

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const label = match[1].toLowerCase();
    const contentStart = match.index! + match[0].length;
    const contentEnd = matches[index + 1]?.index ?? rawText.length;
    const content = rawText.slice(contentStart, contentEnd).trim();
    if (!content) continue;

    if (label.startsWith("câu")) {
      currentQuestion = { content: stripQuestionPrefix(content), answers: [] };
      questions.push(currentQuestion);
      continue;
    }

    if (!currentQuestion) {
      throw new Error(
        "Raw FAQ text must start with a question label before answer labels"
      );
    }
    currentQuestion.answers.push({ content: stripAnswerPrefix(content) });
  }

  if (questions.length === 0 && rawText.trim()) {
    throw new Error(
      "Raw FAQ text must include labels like 'Câu 1:' and 'Trả lời 1:'"
    );
  }

  return questions.filter(
    (question) => question.content && question.answers.length > 0
  );
}

function normalizeQuickAddQuestions(
  data: QuickAddFaqQuestionsRequest
): NormalizedQuickAddQuestion[] {
  const questions: NormalizedQuickAddQuestion[] = [];

  if (data.raw_text?.trim()) {
    questions.push(...parseQuickAddRawText(data.raw_text));
  }

  for (const question of data.questions ?? []) {
    const normalizedQuestion = stripQuestionPrefix(question.content);
    const answers = question.answers
      .map((answer) => ({
        ...answer,
        content: stripAnswerPrefix(answer.content),
      }))
      .filter((answer) => answer.content);

    if (normalizedQuestion && answers.length > 0) {
      questions.push({ content: normalizedQuestion, answers });
    }
  }

  if (questions.length === 0) {
    throw new Error("At least one question with one answer is required");
  }

  return questions;
}

export class FaqQuestionsService extends BaseService<
  FaqQuestionPublic,
  CreateFaqQuestionRequest,
  UpdateFaqQuestionRequest
> {
  protected readonly tableName = "faq_questions";
  protected readonly publicSchema = questionPublicSchema as z.ZodType<
    FaqQuestionPublic,
    any,
    any
  >;
  protected readonly createSchema = z.object({
    sub_topic_id: z.string(),
    content: z.string(),
  });
  protected readonly updateSchema = z.object({
    content: z.string().optional(),
    sub_topic_id: z.string().optional(),
  });

  async findAll(
    filters: FaqQuestionsQuery,
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<FaqQuestionPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`SELECT * FROM get_faq_questions_with_pagination(
          ${filters.sub_topic_id ?? null},
          ${filters.topic_id ?? null},
          ${filters.status ?? null},
          ${filters.content ?? null},
          ${filters.code ?? null},
          ${limit},
          ${offset}
        )`,
      db`SELECT get_faq_questions_count(
          ${filters.sub_topic_id ?? null},
          ${filters.topic_id ?? null},
          ${filters.status ?? null},
          ${filters.content ?? null},
          ${filters.code ?? null}
        ) AS total`,
    ]);
    return this.createPaginatedResponse(
      this.parseMany(dataRows),
      this.extractTotal(countRows),
      limit,
      offset
    );
  }

  async findById(id: string): Promise<FaqQuestionPublic | null> {
    const [row] = await db`SELECT * FROM get_faq_question_by_id(${id})`;
    return row ? this.parseOne(row) : null;
  }

  async create(
    data: CreateFaqQuestionRequest,
    userId?: string
  ): Promise<FaqQuestionPublic> {
    const [row] = await db`
      SELECT * FROM create_faq_question(${data.sub_topic_id}, ${data.content}, ${userId ?? null})
    `;
    return this.parseOne(row);
  }

  async quickAdd(
    data: QuickAddFaqQuestionsRequest,
    userId?: string
  ): Promise<QuickAddFaqQuestionResult[]> {
    const questions = normalizeQuickAddQuestions(data);

    return db.begin(async (tx) => {
      if (data.topic_id) {
        const [subTopic] = await tx`
          SELECT id FROM faq_sub_topics
          WHERE id = ${data.sub_topic_id}
            AND topic_id = ${data.topic_id}
            AND is_active = true
        `;
        if (!subTopic) {
          throw new Error("FAQ sub topic not found under selected topic");
        }
      }

      const results: QuickAddFaqQuestionResult[] = [];

      for (const questionInput of questions) {
        const [questionRow] = await tx`
          SELECT * FROM create_faq_question(${data.sub_topic_id}, ${questionInput.content}, ${userId ?? null})
        `;
        const question = this.parseOne(questionRow);
        const answers: FaqAnswerPublic[] = [];

        for (const answerInput of questionInput.answers) {
          const campusIds = data.apply_all_campuses
            ? []
            : (answerInput.campus_ids ?? data.default_campus_ids ?? []);
          const [answerRow] = await tx`
            SELECT * FROM create_faq_answer(
              ${question.id},
              ${answerInput.content},
              ${toPgTextArray(answerInput.tags)}::text[],
              ${toPgTextArray(answerInput.keywords)}::text[],
              ${toPgTextArray(answerInput.synonyms)}::text[],
              ${userId ?? null},
              ${toPgUuidArray(campusIds)}::uuid[]
            )
          `;
          answers.push(answerPublicSchema.parse(answerRow));
        }

        results.push({ question, answers });
      }

      return results;
    });
  }

  async update(
    id: string,
    data: UpdateFaqQuestionRequest
  ): Promise<FaqQuestionPublic> {
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
