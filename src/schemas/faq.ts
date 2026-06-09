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

export const bulkApproveResponseSchema = z.object({
  message: z.string(),
  approved_count: z.number().int().min(0),
});

const questionStatusEnum = z.enum(["new", "approved", "rejected", "deleted"]);
const answerStatusEnum = z.enum(["new", "approved", "rejected", "deleted"]);
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
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  sort_order: z.number().int().min(0).default(0).optional(),
});

export const updateFaqTopicSchema = z.object({
  code: z.string().min(1).max(50).optional(),
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
  code: z.string(),
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

export const faqSubTopicResponseSchema = z.object({
  data: faqSubTopicPublicSchema,
});
export const faqSubTopicsResponseSchema = z.object({
  data: z.array(faqSubTopicPublicSchema),
  meta: paginationMetaSchema,
});

// ── FAQ Questions ─────────────────────────────────────────────────────────────

export const faqQuestionPublicSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  sub_topic_id: z.string().uuid(),
  content: z.string(),
  status: questionStatusEnum,
  created_by: z.string().uuid().nullable().optional(),
  approved_by: z.string().uuid().nullable().optional(),
  approved_at: z.union([z.string(), z.date()]).nullable().optional(),
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

const quickAddFaqAnswerSchema = z.object({
  content: z.string().min(1, "Answer content is required"),
  campus_ids: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
});

const quickAddFaqQuestionSchema = z.object({
  content: z.string().min(1, "Question content is required"),
  answers: z
    .array(quickAddFaqAnswerSchema)
    .min(1, "At least one answer is required"),
});

export const quickAddFaqQuestionsSchema = z
  .object({
    topic_id: z.string().uuid("Invalid topic ID").optional(),
    sub_topic_id: z.string().uuid("Invalid sub topic ID"),
    raw_text: z.string().optional(),
    default_campus_ids: z.array(z.string().uuid()).optional(),
    apply_all_campuses: z.boolean().optional(),
    questions: z.array(quickAddFaqQuestionSchema).optional(),
  })
  .refine(
    (data) => Boolean(data.raw_text?.trim()) || Boolean(data.questions?.length),
    {
      message: "raw_text or questions is required",
      path: ["questions"],
    }
  );

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
  topic_id: z.string().uuid().optional(),
  status: questionStatusEnum.optional(),
  content: z.string().optional(),
  code: z.string().optional(),
});

export const faqQuestionResponseSchema = z.object({
  data: faqQuestionPublicSchema,
});
export const faqQuestionsResponseSchema = z.object({
  data: z.array(faqQuestionPublicSchema),
  meta: paginationMetaSchema,
});

// ── FAQ Answers ───────────────────────────────────────────────────────────────

export const faqAnswerPublicSchema = z.object({
  id: z.string().uuid(),
  question_id: z.string().uuid(),
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
  rejected_by: z.string().uuid().nullable().optional(),
  rejected_at: z.union([z.string(), z.date()]).nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  version: z.number().int(),
  created_at: z.union([z.string(), z.date()]),
  updated_at: z.union([z.string(), z.date()]),
});

export const createFaqAnswerSchema = z.object({
  question_id: z.string().uuid("Invalid question ID"),
  content: z.string().min(1, "Answer content is required"),
  campus_ids: z.any().optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
});

export const updateFaqAnswerSchema = z.object({
  content: z.string().min(1).optional(),
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
  status: answerStatusEnum.optional(),
});

export const questionIdParamSchema = z.object({
  questionId: z.string().uuid("Invalid question ID"),
});

export const faqAnswerResponseSchema = z.object({
  data: faqAnswerPublicSchema,
});
export const faqAnswersResponseSchema = z.object({
  data: z.array(faqAnswerPublicSchema),
  meta: paginationMetaSchema,
});

export const quickAddFaqQuestionsResponseSchema = z.object({
  data: z.array(
    z.object({
      question: faqQuestionPublicSchema,
      answers: z.array(faqAnswerPublicSchema),
    })
  ),
  meta: z.object({
    question_count: z.number().int(),
    answer_count: z.number().int(),
  }),
});

// ── FAQ Collections ───────────────────────────────────────────────────────────

export const faqCollectionPublicSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  admission_year: z.number().int(),
  status: collectionStatusEnum,
  published_by: z.string().uuid().nullable().optional(),
  published_at: z.union([z.string(), z.date()]).nullable().optional(),
});

export const faqCollectionAnswerDetailSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  status: answerStatusEnum,
  applies_to_all_campuses: z.boolean(),
  campus_ids: z.array(z.string().uuid()),
  campus_codes: z.array(z.string()),
  campus_names: z.array(z.string()),
  tags: z.array(z.string()).nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  synonyms: z.array(z.string()).nullable().optional(),
  version: z.number().int(),
});

export const faqCollectionQuestionDetailSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  content: z.string(),
  status: questionStatusEnum,
  sort_order: z.number().int(),
  answers: z.array(faqCollectionAnswerDetailSchema),
});

export const faqCollectionSubTopicDetailSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  sort_order: z.number().int(),
  questions: z.array(faqCollectionQuestionDetailSchema),
});

export const faqCollectionTopicDetailSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  sort_order: z.number().int(),
  sub_topics: z.array(faqCollectionSubTopicDetailSchema),
});

export const faqCollectionDetailSchema = faqCollectionPublicSchema.extend({
  topics: z.array(faqCollectionTopicDetailSchema),
});

export const createFaqCollectionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  admission_year: z.number().int().min(2020).max(2050),
});

export const updateFaqCollectionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  admission_year: z.number().int().min(2020).max(2050).optional(),
});

export const transitionCollectionStatusSchema = z.object({
  status: collectionStatusEnum,
});

export const addCollectionItemsSchema = z.object({
  question_ids: z
    .array(z.string().uuid())
    .min(1, "At least one question ID required"),
});

export const addCollectionSubTopicQuestionsSchema = z.object({
  sub_topic_id: z.string().uuid("Invalid sub topic ID"),
});

export const exportFaqCollectionTopicsMarkdownSchema = z.object({
  topic_ids: z
    .array(z.string().uuid("Invalid topic ID"))
    .min(1, "At least one topic ID required"),
});

export const copyCollectionSchema = z.object({
  admission_year: z.number().int().min(2020).max(2050),
  name: z.string().min(1).max(255).optional(),
});

export const collectionItemParamSchema = z.object({
  id: z.string().uuid("Invalid collection ID"),
  questionId: z.string().uuid("Invalid question ID"),
});

export const faqCollectionsQuerySchema = paginationQuerySchema.extend({
  status: collectionStatusEnum.optional(),
  admission_year: z.coerce.number().int().optional(),
});

export const faqCollectionResponseSchema = z.object({
  data: faqCollectionPublicSchema,
});
export const faqCollectionDetailResponseSchema = z.object({
  data: faqCollectionDetailSchema,
});
export const faqCollectionsResponseSchema = z.object({
  data: z.array(faqCollectionPublicSchema),
  meta: paginationMetaSchema,
});

export const addCollectionItemsResponseSchema = z.object({
  message: z.string(),
  inserted: z.number(),
});

export const addCollectionSubTopicQuestionsResponseSchema =
  addCollectionItemsResponseSchema.extend({
    matched_count: z.number(),
  });

export const exportFaqCollectionTopicsMarkdownResponseSchema = z.object({
  data: z.array(
    z.object({
      topic_id: z.string().uuid(),
      topic_code: z.string(),
      topic_name: z.string(),
      filename: z.string(),
      content: z.string(),
      record_count: z.number().int(),
    })
  ),
  meta: z.object({
    collection_id: z.string().uuid(),
    collection_name: z.string(),
    requested_topic_count: z.number().int(),
    exported_topic_count: z.number().int(),
  }),
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
  keyword: z.string().optional(),
  status: z.string().optional(),
});

export const faqSearchResponseSchema = z.object({
  data: z.array(faqSearchResultSchema),
  meta: paginationMetaSchema,
});
