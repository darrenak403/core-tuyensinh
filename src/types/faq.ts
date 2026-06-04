export type QuestionStatus = "new" | "approved" | "published" | "rejected" | "deleted";
export type AnswerStatus = "new" | "approved" | "published" | "rejected" | "updated" | "re_approved";
export type CollectionStatus = "draft" | "published" | "archived";

// ── DB entities ──────────────────────────────────────────────────────────────

export interface FaqTopic {
  id: string;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FaqSubTopic {
  id: string;
  topic_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FaqQuestion {
  id: string;
  sub_topic_id: string;
  content: string;
  status: QuestionStatus;
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;
  published_by?: string;
  published_at?: Date;
  rejected_by?: string;
  rejected_at?: Date;
  rejection_reason?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FaqAnswer {
  id: string;
  question_id: string;
  admission_year: number;
  content: string;
  status: AnswerStatus;
  tags?: string[];
  keywords?: string[];
  synonyms?: string[];
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;
  published_by?: string;
  published_at?: Date;
  rejected_by?: string;
  rejected_at?: Date;
  rejection_reason?: string;
  version: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FaqCollection {
  id: string;
  name: string;
  description?: string;
  admission_year: number;
  campus_id?: string;
  status: CollectionStatus;
  published_by?: string;
  published_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ── Public DTOs (API responses) ───────────────────────────────────────────────

export interface FaqTopicPublic {
  id: string;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface FaqSubTopicPublic {
  id: string;
  topic_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface FaqQuestionPublic {
  id: string;
  sub_topic_id: string;
  content: string;
  status: QuestionStatus;
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;
  published_by?: string;
  published_at?: Date;
  rejected_by?: string;
  rejected_at?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FaqAnswerPublic {
  id: string;
  question_id: string;
  admission_year: number;
  content: string;
  status: AnswerStatus;
  tags?: string[];
  keywords?: string[];
  synonyms?: string[];
  campus_ids: string[];
  applies_to_all_campuses: boolean;
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;
  published_by?: string;
  published_at?: Date;
  rejected_by?: string;
  rejected_at?: Date;
  rejection_reason?: string;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface FaqCollectionPublic {
  id: string;
  name: string;
  description?: string;
  admission_year: number;
  campus_id?: string;
  status: CollectionStatus;
  published_by?: string;
  published_at?: Date;
}

export interface FaqSearchResult {
  answer_id: string;
  question_id: string;
  question_content: string;
  question_status: QuestionStatus;
  sub_topic_id: string;
  sub_topic_name: string;
  topic_id: string;
  topic_name: string;
  answer_content: string;
  answer_status: AnswerStatus;
  admission_year: number;
  campus_ids: string[];
  applies_to_all_campuses: boolean;
  tags?: string[];
  keywords?: string[];
  synonyms?: string[];
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateFaqTopicRequest {
  code: string;
  name: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateFaqTopicRequest {
  code?: string;
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateFaqSubTopicRequest {
  topic_id: string;
  name: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateFaqSubTopicRequest {
  topic_id?: string;
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateFaqQuestionRequest {
  sub_topic_id: string;
  content: string;
}

export interface UpdateFaqQuestionRequest {
  content?: string;
  sub_topic_id?: string;
}

export interface TransitionQuestionStatusRequest {
  status: QuestionStatus;
  rejection_reason?: string;
}

export interface CreateFaqAnswerRequest {
  question_id: string;
  admission_year: number;
  content: string;
  tags?: string[];
  keywords?: string[];
  synonyms?: string[];
}

export interface UpdateFaqAnswerRequest {
  content?: string;
  admission_year?: number;
  tags?: string[];
  keywords?: string[];
  synonyms?: string[];
}

export interface SetFaqAnswerCampusesRequest {
  campus_ids: string[];
}

export interface TransitionAnswerStatusRequest {
  status: AnswerStatus;
  rejection_reason?: string;
}

export interface CreateFaqCollectionRequest {
  name: string;
  description?: string;
  admission_year: number;
  campus_id?: string;
}

export interface UpdateFaqCollectionRequest {
  name?: string;
  description?: string;
  admission_year?: number;
  campus_id?: string;
}

export interface TransitionCollectionStatusRequest {
  status: CollectionStatus;
}

export interface AddCollectionItemsRequest {
  answer_ids: string[];
}

export interface FaqSearchQuery {
  topic_id?: string;
  sub_topic_id?: string;
  campus_id?: string;
  admission_year?: number;
  keyword?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// ── Response wrappers ─────────────────────────────────────────────────────────

export interface FaqTopicResponse { data: FaqTopicPublic }
export interface FaqTopicsResponse { data: FaqTopicPublic[]; meta: PaginationMeta }
export interface FaqSubTopicResponse { data: FaqSubTopicPublic }
export interface FaqSubTopicsResponse { data: FaqSubTopicPublic[]; meta: PaginationMeta }
export interface FaqQuestionResponse { data: FaqQuestionPublic }
export interface FaqQuestionsResponse { data: FaqQuestionPublic[]; meta: PaginationMeta }
export interface FaqAnswerResponse { data: FaqAnswerPublic }
export interface FaqAnswersResponse { data: FaqAnswerPublic[]; meta: PaginationMeta }
export interface FaqCollectionResponse { data: FaqCollectionPublic }
export interface FaqCollectionsResponse { data: FaqCollectionPublic[]; meta: PaginationMeta }
export interface FaqSearchResponse { data: FaqSearchResult[]; meta: PaginationMeta }

interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}
