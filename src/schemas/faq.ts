import { z } from "zod";

// ── Shared ────────────────────────────────────────────────────────────────────

export const paginationMetaSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean(),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const faqErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export const deleteResponseSchema = z.object({
  message: z.string(),
});

const questionStatusEnum = z.enum(["new", "approved", "published", "rejected", "deleted"]);
const answerStatusEnum = z.enum(["new", "approved", "published", "rejected", "updated", "re_approved"]);
const collectionStatusEnum = z.enum(["draft", "published", "archived"]);

// ── FAQ Topics ────────────────────────────────────────────────────────────────

export const faqTopicPublicSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sort_order: z.number(),
  is_active: z.boolean(),
});

export const createFaqTopicSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sort_order: z.number().int().min(0).default(0).optional(),
});

export const updateFaqTopicSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const faqTopicsQuerySchema = paginationQuerySchema;

export const faqTopicResponseSchema = z.object({ data: faqTopicPublicSchema });
export const faqTopicsResponseSchema = z.object({
  data: z.array(faqTopicPublicSchema),
  meta: paginationMetaSchema,
});

// ── FAQ Sub Topics ────────────────────────────────────────────────────────────

export const faqSubTopicPublicSchema = z.object({
  id: z.string().uuid(),
  topic_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sort_order: z.number(),
  is_active: z.boolean(),
});

export const createFaqSubTopicSchema = z.object({
  topic_id: z.string().uuid("Invalid topic ID"),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sort_order: z.number().int().min(0).default(0).optional(),
});

export const updateFaqSubTopicSchema = z.object({
  topic_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const faqSubTopicsQuerySchema = paginationQuerySchema.extend({
  topic_id: z.string().uuid().optional(),
});

export const topicIdParamSchema = z.object({
  topicId: z.string().uuid("Invalid topic ID"),
});

export const faqSubTopicResponseSchema = z.object({ data: faqSubTopicPublicSchema });
export const faqSubTopicsResponseSchema = z.object({
  data: z.array(faqSubTopicPublicSchema),
  meta: paginationMetaSchema,
});

// ── FAQ Questions ─────────────────────────────────────────────────────────────

export const faqQuestionPublicSchema = z.object({
  id: z.string().uuid(),
  sub_topic_id: z.string().uuid(),
  content: z.string(),
  status: questionStatusEnum,
  created_by: z.string().uuid().nullable().optional(),
  approved_by: z.string().uuid().nullable().optional(),
  approved_at: z.union([z.string(), z.date()]).nullable().optional(),
  published_by: z.string().uuid().nullable().optional(),
  published_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejected_by: z.string().uuid().nullable().optional(),
  rejected_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
});

export const createFaqQuestionSchema = z.object({
  sub_topic_id: z.string().uuid("Invalid sub topic ID"),
  content: z.string().min(1, "Question content is required"),
});

export const updateFaqQuestionSchema = z.object({
  content: z.string().min(1).optional(),
  sub_topic_id: z.string().uuid().optional(),
});

export const transitionQuestionStatusSchema = z.object({
  status: questionStatusEnum,
  rejection_reason: z.string().optional(),
});

export const faqQuestionsQuerySchema = paginationQuerySchema.extend({
  sub_topic_id: z.string().uuid().optional(),
  status: questionStatusEnum.optional(),
});

export const faqQuestionResponseSchema = z.object({ data: faqQuestionPublicSchema });
export const faqQuestionsResponseSchema = z.object({
  data: z.array(faqQuestionPublicSchema),
  meta: paginationMetaSchema,
});

// ── FAQ Answers ───────────────────────────────────────────────────────────────

export const faqAnswerPublicSchema = z.object({
  id: z.string().uuid(),
  question_id: z.string().uuid(),
  admission_year: z.number().int(),
  content: z.string(),
  status: answerStatusEnum,
  tags: z.array(z.string()).nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  synonyms: z.array(z.string()).nullable().optional(),
  campus_ids: z.array(z.string().uuid()),
  applies_to_all_campuses: z.boolean(),
  created_by: z.string().uuid().nullable().optional(),
  approved_by: z.string().uuid().nullable().optional(),
  approved_at: z.union([z.string(), z.date()]).nullable().optional(),
  published_by: z.string().uuid().nullable().optional(),
  published_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejected_by: z.string().uuid().nullable().optional(),
  rejected_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  version: z.number().int(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
});

export const createFaqAnswerSchema = z.object({
  question_id: z.string().uuid("Invalid question ID"),
  admission_year: z.number().int().min(2020).max(2050),
  content: z.string().min(1, "Answer content is required"),
  campus_ids: z.any().optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
});

export const updateFaqAnswerSchema = z.object({
  content: z.string().min(1).optional(),
  admission_year: z.number().int().min(2020).max(2050).optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
});

export const setFaqAnswerCampusesSchema = z.object({
  campus_ids: z.array(z.string().uuid()),
});

export const transitionAnswerStatusSchema = z.object({
  status: answerStatusEnum,
  rejection_reason: z.string().optional(),
});

export const faqAnswersQuerySchema = paginationQuerySchema.extend({
  question_id: z.string().uuid().optional(),
  campus_id: z.string().uuid().optional(),
  admission_year: z.coerce.number().int().optional(),
  status: answerStatusEnum.optional(),
});

export const questionIdParamSchema = z.object({
  questionId: z.string().uuid("Invalid question ID"),
});

export const faqAnswerResponseSchema = z.object({ data: faqAnswerPublicSchema });
export const faqAnswersResponseSchema = z.object({
  data: z.array(faqAnswerPublicSchema),
  meta: paginationMetaSchema,
});

// ── FAQ Collections ───────────────────────────────────────────────────────────

export const faqCollectionPublicSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  admission_year: z.number().int(),
  campus_id: z.string().uuid().nullable().optional(),
  status: collectionStatusEnum,
  published_by: z.string().uuid().nullable().optional(),
  published_at: z.union([z.string(), z.date()]).nullable().optional(),
});

export const createFaqCollectionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  admission_year: z.number().int().min(2020).max(2050),
  campus_id: z.string().uuid().optional(),
});

export const updateFaqCollectionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  admission_year: z.number().int().min(2020).max(2050).optional(),
  campus_id: z.string().uuid().optional(),
});

export const transitionCollectionStatusSchema = z.object({
  status: collectionStatusEnum,
});

export const addCollectionItemsSchema = z.object({
  answer_ids: z.array(z.string().uuid()).min(1, "At least one answer ID required"),
});

export const collectionItemParamSchema = z.object({
  id: z.string().uuid("Invalid collection ID"),
  answerId: z.string().uuid("Invalid answer ID"),
});

export const faqCollectionsQuerySchema = paginationQuerySchema.extend({
  status: collectionStatusEnum.optional(),
  admission_year: z.coerce.number().int().optional(),
  campus_id: z.string().uuid().optional(),
});

export const faqCollectionResponseSchema = z.object({ data: faqCollectionPublicSchema });
export const faqCollectionsResponseSchema = z.object({
  data: z.array(faqCollectionPublicSchema),
  meta: paginationMetaSchema,
});

export const addCollectionItemsResponseSchema = z.object({
  message: z.string(),
  inserted: z.number(),
});

// ── Search ────────────────────────────────────────────────────────────────────

export const faqSearchResultSchema = z.object({
  answer_id: z.string().uuid(),
  question_id: z.string().uuid(),
  question_content: z.string(),
  question_status: questionStatusEnum,
  sub_topic_id: z.string().uuid(),
  sub_topic_name: z.string(),
  topic_id: z.string().uuid(),
  topic_name: z.string(),
  answer_content: z.string(),
  answer_status: answerStatusEnum,
  admission_year: z.number().int(),
  campus_ids: z.array(z.string().uuid()),
  applies_to_all_campuses: z.boolean(),
  tags: z.array(z.string()).nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  synonyms: z.array(z.string()).nullable().optional(),
});

export const faqSearchQuerySchema = paginationQuerySchema.extend({
  topic_id: z.string().uuid().optional(),
  sub_topic_id: z.string().uuid().optional(),
  campus_id: z.string().uuid().optional(),
  admission_year: z.coerce.number().int().optional(),
  keyword: z.string().optional(),
  status: z.string().optional(),
});

export const faqSearchResponseSchema = z.object({
  data: z.array(faqSearchResultSchema),
  meta: paginationMetaSchema,
});
