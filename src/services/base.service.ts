/**
 * Base service class with common database operations and Zod validation
 */

import { z } from "zod";

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Generic base service with CRUD operations and validation
 */
export abstract class BaseService<TPublic, TCreate, TUpdate> {
  protected abstract readonly tableName: string;
  protected abstract readonly publicSchema: z.ZodType<TPublic, any, any>;
  protected abstract readonly createSchema: z.ZodType<TCreate, any, any>;
  protected abstract readonly updateSchema: z.ZodType<TUpdate, any, any>;

  /**
   * Parse single row with validation
   */
  protected parseOne(row: unknown): TPublic {
    return this.publicSchema.parse(row);
  }

  /**
   * Parse multiple rows with validation
   */
  protected parseMany(rows: unknown[]): TPublic[] {
    return z.array(this.publicSchema).parse(rows);
  }

  /**
   * Create pagination metadata
   */
  protected createPaginationMeta(
    total: number,
    limit: number,
    offset: number
  ): PaginationMeta {
    return {
      total,
      limit,
      offset,
      has_next: offset + limit < total,
      has_prev: offset > 0,
    };
  }

  /**
   * Create paginated response with data and metadata
   */
  protected createPaginatedResponse<T>(
    data: T[],
    total: number,
    limit: number,
    offset: number
  ): PaginatedResponse<T> {
    return {
      data,
      meta: this.createPaginationMeta(total, limit, offset),
    };
  }

  /**
   * Extract total count from database result safely
   */
  protected extractTotal(result: any[]): number {
    return Number(result[0]?.total) || 0;
  }

  /**
   * Parse with fallback for safer error handling
   */
  protected parseWithFallback(data: unknown, fallback: TPublic): TPublic {
    try {
      return this.publicSchema.parse(data);
    } catch {
      return fallback;
    }
  }
}

/**
 * Common Zod schemas for database fields
 */
export const commonSchemas = {
  uuid: z.string().uuid(),
  optionalString: z
    .string()
    .nullable()
    .transform((val) => val || undefined),
  optionalNumber: z
    .number()
    .nullable()
    .transform((val) => val || undefined),
  timestamp: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val)),
  boolean: z.boolean().default(true),
};
