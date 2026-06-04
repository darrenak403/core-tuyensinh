import { db } from "@config/database";
import type {
  CollectionStatus,
  CreateFaqCollectionRequest,
  FaqCollectionPublic,
  UpdateFaqCollectionRequest,
} from "@app-types/faq";
import { createFaqCollectionSchema, updateFaqCollectionSchema } from "@schemas/faq";
import { z } from "zod";
import { BaseService, type PaginatedResponse, commonSchemas } from "./base.service";

const collectionPublicSchema = z.object({
  id: commonSchemas.uuid,
  name: z.string(),
  description: commonSchemas.optionalString,
  admission_year: z.number(),
  campus_id: z.string().uuid().nullable().optional(),
  status: z.string(),
  published_by: z.string().uuid().nullable().optional(),
  published_at: z.union([z.string(), z.date()]).nullable().optional(),
});

export class FaqCollectionsService extends BaseService<FaqCollectionPublic, CreateFaqCollectionRequest, UpdateFaqCollectionRequest> {
  protected readonly tableName = "faq_collections";
  protected readonly publicSchema = collectionPublicSchema as z.ZodType<FaqCollectionPublic, any, any>;
  protected readonly createSchema = createFaqCollectionSchema as z.ZodType<CreateFaqCollectionRequest, any, any>;
  protected readonly updateSchema = updateFaqCollectionSchema as z.ZodType<UpdateFaqCollectionRequest, any, any>;

  async findAll(
    filters: { status?: string; admission_year?: number; campus_id?: string },
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<FaqCollectionPublic>> {
    const [dataRows, countRows] = await Promise.all([
      db`SELECT * FROM get_faq_collections_with_pagination(
          ${filters.status ?? null},
          ${filters.admission_year ?? null},
          ${filters.campus_id ?? null},
          ${limit},
          ${offset}
        )`,
      db`SELECT get_faq_collections_count(
          ${filters.status ?? null},
          ${filters.admission_year ?? null},
          ${filters.campus_id ?? null}
        ) AS total`,
    ]);
    return this.createPaginatedResponse(this.parseMany(dataRows), this.extractTotal(countRows), limit, offset);
  }

  async findById(id: string): Promise<FaqCollectionPublic | null> {
    const [row] = await db`SELECT * FROM get_faq_collection_by_id(${id})`;
    return row ? this.parseOne(row) : null;
  }

  async create(data: CreateFaqCollectionRequest): Promise<FaqCollectionPublic> {
    const [row] = await db`
      SELECT * FROM create_faq_collection(
        ${data.name},
        ${data.admission_year},
        ${data.description ?? null},
        ${data.campus_id ?? null}
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
        ${data.admission_year ?? null},
        ${data.campus_id ?? null}
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

  async addItems(collectionId: string, answerIds: string[]): Promise<number> {
    const [row] = await db`SELECT add_faq_collection_items(${collectionId}, ${answerIds}) AS inserted`;
    return Number(row?.inserted ?? 0);
  }

  async removeItem(collectionId: string, answerId: string): Promise<void> {
    await db`SELECT remove_faq_collection_item(${collectionId}, ${answerId})`;
  }

  async delete(id: string): Promise<void> {
    await db`SELECT delete_faq_collection(${id})`;
  }
}
