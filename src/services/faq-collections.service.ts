import type {
  CollectionStatus,
  CopyFaqCollectionRequest,
  CreateFaqCollectionRequest,
  FaqCollectionAnswerDetail,
  FaqCollectionDetail,
  FaqCollectionExportRow,
  FaqCollectionPublic,
  FaqCollectionQuestionDetail,
  FaqCollectionSubTopicDetail,
  FaqCollectionTopicDetail,
  UpdateFaqCollectionRequest,
} from "@app-types/faq";
import { db } from "@config/database";
import { createFaqCollectionSchema, updateFaqCollectionSchema } from "@schemas/faq";
import { z } from "zod";
import { BaseService, type PaginatedResponse, commonSchemas } from "./base.service";

const collectionPublicSchema = z.object({
  id: commonSchemas.uuid,
  name: z.string(),
  description: commonSchemas.optionalString,
  admission_year: z.number(),
  status: z.string(),
  published_by: z.string().uuid().nullable().optional(),
  published_at: z.union([z.string(), z.date()]).nullable().optional(),
});

type FaqCollectionDetailRow = {
  collection_id: string;
  collection_name: string;
  collection_description: string | null;
  admission_year: number;
  collection_status: CollectionStatus;
  published_by: string | null;
  published_at: Date | string | null;
  topic_id: string;
  topic_code: string;
  topic_name: string;
  topic_sort_order: number;
  sub_topic_id: string;
  sub_topic_code: string;
  sub_topic_name: string;
  sub_topic_sort_order: number;
  question_id: string;
  question_code: string;
  question_content: string;
  question_status: "new" | "approved" | "rejected" | "deleted";
  question_sort_order: number;
  answer_id: string | null;
  answer_content: string | null;
  answer_status: "new" | "approved" | "rejected" | "deleted" | null;
  answer_version: number | null;
  tags: string[] | string | null;
  keywords: string[] | string | null;
  synonyms: string[] | string | null;
  campus_ids: string[] | string | null;
  campus_codes: string[] | string | null;
  campus_names: string[] | string | null;
  applies_to_all_campuses: boolean | null;
};

type FaqCollectionQuestionIdRow = {
  id: string;
};

function parsePgArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val !== "string" || !val || val === "{}") return [];
  return val
    .replace(/^{|}$/g, "")
    .split(",")
    .filter(Boolean)
    .map((s) => s.trim().replace(/^"|"$/g, ""));
}

export class FaqCollectionsService extends BaseService<FaqCollectionPublic, CreateFaqCollectionRequest, UpdateFaqCollectionRequest> {
  protected readonly tableName = "faq_collections";
  protected readonly publicSchema = collectionPublicSchema as z.ZodType<FaqCollectionPublic, any, any>;
  protected readonly createSchema = createFaqCollectionSchema as z.ZodType<CreateFaqCollectionRequest, any, any>;
  protected readonly updateSchema = updateFaqCollectionSchema as z.ZodType<UpdateFaqCollectionRequest, any, any>;

  async findAll(
    filters: { status?: string; admission_year?: number },
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<FaqCollectionPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`SELECT * FROM get_faq_collections_with_pagination(
          ${filters.status ?? null},
          ${filters.admission_year ?? null},
          ${limit},
          ${offset}
        )`,
      db`SELECT get_faq_collections_count(
          ${filters.status ?? null},
          ${filters.admission_year ?? null}
        ) AS total`,
    ]);
    return this.createPaginatedResponse(this.parseMany(dataRows), this.extractTotal(countRows), limit, offset);
  }

  async findById(id: string): Promise<FaqCollectionPublic | null> {
    const [row] = await db`SELECT * FROM get_faq_collection_by_id(${id})`;
    return row ? this.parseOne(row) : null;
  }

  async findDetailById(id: string): Promise<FaqCollectionDetail | null> {
    const rows = (await db`
      SELECT
        c.id AS collection_id,
        c.name AS collection_name,
        c.description AS collection_description,
        c.admission_year,
        c.status AS collection_status,
        c.published_by,
        c.published_at,
        t.id AS topic_id,
        t.code AS topic_code,
        t.name AS topic_name,
        t.sort_order AS topic_sort_order,
        s.id AS sub_topic_id,
        s.code AS sub_topic_code,
        s.name AS sub_topic_name,
        s.sort_order AS sub_topic_sort_order,
        q.id AS question_id,
        q.code AS question_code,
        q.content AS question_content,
        q.status AS question_status,
        ci.sort_order AS question_sort_order,
        a.id AS answer_id,
        a.content AS answer_content,
        a.status AS answer_status,
        a.version AS answer_version,
        a.tags,
        a.keywords,
        a.synonyms,
        COALESCE(ARRAY_AGG(campus.id::text ORDER BY campus.name) FILTER (WHERE campus.id IS NOT NULL), ARRAY[]::text[]) AS campus_ids,
        COALESCE(ARRAY_AGG(campus.code ORDER BY campus.name) FILTER (WHERE campus.id IS NOT NULL), ARRAY[]::varchar[]) AS campus_codes,
        COALESCE(ARRAY_AGG(campus.name ORDER BY campus.name) FILTER (WHERE campus.id IS NOT NULL), ARRAY[]::varchar[]) AS campus_names,
        (a.id IS NOT NULL AND COUNT(fac.campus_id) = 0) AS applies_to_all_campuses
      FROM faq_collections c
      JOIN faq_collection_items ci ON ci.collection_id = c.id
      JOIN faq_questions q ON q.id = ci.question_id AND q.is_active = true
      JOIN faq_sub_topics s ON s.id = q.sub_topic_id AND s.is_active = true
      JOIN faq_topics t ON t.id = s.topic_id AND t.is_active = true
      LEFT JOIN faq_answers a ON a.question_id = q.id AND a.is_active = true
      LEFT JOIN faq_answer_campuses fac ON fac.answer_id = a.id
      LEFT JOIN campuses campus ON campus.id = fac.campus_id
      WHERE c.id = ${id}
        AND c.is_active = true
      GROUP BY c.id, t.id, s.id, q.id, ci.sort_order, a.id
      ORDER BY t.sort_order ASC, t.name ASC,
        s.sort_order ASC, s.name ASC,
        ci.sort_order ASC, q.created_at ASC,
        a.created_at ASC
    `) as FaqCollectionDetailRow[];

    if (rows.length === 0) {
      const collection = await this.findById(id);
      return collection ? { ...collection, topics: [] } : null;
    }

    return this.buildCollectionDetail(rows);
  }

  async getExportRows(id: string): Promise<FaqCollectionExportRow[] | null> {
    const detail = await this.findDetailById(id);
    if (!detail) return null;
    return this.buildExportRows(detail);
  }

  async create(data: CreateFaqCollectionRequest): Promise<FaqCollectionPublic> {
    const [row] = await db`
      SELECT * FROM create_faq_collection(
        ${data.name},
        ${data.admission_year},
        ${data.description ?? null}
      )
    `;
    return this.parseOne(row);
  }

  async update(id: string, data: UpdateFaqCollectionRequest): Promise<FaqCollectionPublic> {
    const [row] = await db`
      SELECT * FROM update_faq_collection(
        ${id},
        ${data.name ?? null},
        ${data.description ?? null},
        ${data.admission_year ?? null}
      )
    `;
    return this.parseOne(row);
  }

  async transitionStatus(id: string, newStatus: CollectionStatus, userId?: string): Promise<FaqCollectionPublic> {
    const [row] = await db`
      SELECT * FROM transition_faq_collection_status(${id}, ${newStatus}, ${userId ?? null})
    `;
    return this.parseOne(row);
  }

  async addItems(collectionId: string, questionIds: string[]): Promise<number> {
    const uuidArray = questionIds.length > 0 ? `{${questionIds.join(',')}}` : '{}';
    const [row] = await db`SELECT add_faq_collection_items(${collectionId}, ${uuidArray}::uuid[]) AS inserted`;
    return Number(row?.inserted ?? 0);
  }

  async addApprovedQuestionsBySubTopic(
    collectionId: string,
    subTopicId: string
  ): Promise<{ matched_count: number; inserted: number }> {
    const rows = (await db`
      SELECT id
      FROM faq_questions
      WHERE sub_topic_id = ${subTopicId}
        AND status = 'approved'
        AND is_active = true
      ORDER BY created_at ASC
    `) as FaqCollectionQuestionIdRow[];
    const questionIds = rows.map((row) => String(row.id));
    const inserted = await this.addItems(collectionId, questionIds);

    return { matched_count: questionIds.length, inserted };
  }

  async removeItem(collectionId: string, questionId: string): Promise<void> {
    await db`SELECT remove_faq_collection_item(${collectionId}, ${questionId})`;
  }

  async copy(sourceId: string, data: CopyFaqCollectionRequest): Promise<FaqCollectionPublic> {
    const [row] = await db`
      SELECT * FROM copy_faq_collection(
        ${sourceId},
        ${data.admission_year},
        ${data.name ?? null}
      )
    `;
    return this.parseOne(row);
  }

  async delete(id: string): Promise<void> {
    await db`SELECT delete_faq_collection(${id})`;
  }

  private buildCollectionDetail(rows: FaqCollectionDetailRow[]): FaqCollectionDetail {
    const first = rows[0]!;
    const topics = new Map<string, FaqCollectionTopicDetail>();
    const subTopics = new Map<string, FaqCollectionSubTopicDetail>();
    const questions = new Map<string, FaqCollectionQuestionDetail>();

    for (const row of rows) {
      let topic = topics.get(row.topic_id);
      if (!topic) {
        topic = {
          id: row.topic_id,
          code: row.topic_code,
          name: row.topic_name,
          sort_order: row.topic_sort_order,
          sub_topics: [],
        };
        topics.set(row.topic_id, topic);
      }

      let subTopic = subTopics.get(row.sub_topic_id);
      if (!subTopic) {
        subTopic = {
          id: row.sub_topic_id,
          code: row.sub_topic_code,
          name: row.sub_topic_name,
          sort_order: row.sub_topic_sort_order,
          questions: [],
        };
        subTopics.set(row.sub_topic_id, subTopic);
        topic.sub_topics.push(subTopic);
      }

      let question = questions.get(row.question_id);
      if (!question) {
        question = {
          id: row.question_id,
          code: row.question_code,
          content: row.question_content,
          status: row.question_status,
          sort_order: row.question_sort_order,
          answers: [],
        };
        questions.set(row.question_id, question);
        subTopic.questions.push(question);
      }

      if (row.answer_id) {
        const answer: FaqCollectionAnswerDetail = {
          id: row.answer_id,
          content: row.answer_content ?? "",
          status: row.answer_status ?? "new",
          applies_to_all_campuses: Boolean(row.applies_to_all_campuses),
          campus_ids: parsePgArray(row.campus_ids),
          campus_codes: parsePgArray(row.campus_codes),
          campus_names: parsePgArray(row.campus_names),
          tags: parsePgArray(row.tags),
          keywords: parsePgArray(row.keywords),
          synonyms: parsePgArray(row.synonyms),
          version: row.answer_version ?? 1,
        };
        question.answers.push(answer);
      }
    }

    return {
      id: first.collection_id,
      name: first.collection_name,
      description: first.collection_description ?? undefined,
      admission_year: first.admission_year,
      status: first.collection_status,
      published_by: first.published_by ?? undefined,
      published_at: first.published_at ? new Date(first.published_at) : undefined,
      topics: Array.from(topics.values()),
    };
  }

  private buildExportRows(detail: FaqCollectionDetail): FaqCollectionExportRow[] {
    const rows: FaqCollectionExportRow[] = [];
    let seq = 1;

    for (const topic of detail.topics) {
      for (const subTopic of topic.sub_topics) {
        for (const question of subTopic.questions) {
          const answers = question.answers.length > 0 ? question.answers : [null];

          for (const answer of answers) {
            const campusNames = getExportCampusNames(answer);
            const campusCodes = getExportCampusCodes(answer);

            for (let i = 0; i < campusNames.length; i += 1) {
              const campusName = campusNames[i] ?? "Tất cả cơ sở";
              const campusCode = campusCodes[i] ?? "ALL";

              rows.push({
                record_id: buildRecordId(detail.admission_year, campusCode, topic.code, seq),
                main_topic: topic.name,
                sub_topic: subTopic.name,
                question: question.content,
                question_aliases: answer?.synonyms ?? [],
                answer: answer?.content ?? "",
                admission_year: detail.admission_year,
                campus: campusName,
                question_status: question.status,
                answer_status: answer?.status ?? "",
              });
              seq += 1;
            }
          }
        }
      }
    }

    return rows;
  }
}

function buildRecordId(year: number, campusCode: string, topicCode: string, seq: number): string {
  return `FAQ${year}${compactCode(campusCode)}${compactCode(topicCode)}${String(seq).padStart(3, "0")}`;
}

function compactCode(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function getExportCampusNames(answer: FaqCollectionAnswerDetail | null): string[] {
  if (!answer) return [""];
  if (!answer.applies_to_all_campuses && answer.campus_names.length > 0) {
    return answer.campus_names;
  }
  return ["Tất cả cơ sở"];
}

function getExportCampusCodes(answer: FaqCollectionAnswerDetail | null): string[] {
  if (!answer) return ["ALL"];
  if (!answer.applies_to_all_campuses && answer.campus_codes.length > 0) {
    return answer.campus_codes;
  }
  return ["ALL"];
}
