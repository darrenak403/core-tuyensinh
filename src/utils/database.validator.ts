/**
 * Database validation utilities using composition pattern
 */

import { z } from "zod";

/**
 * Common database field schemas
 */
export const dbSchemas = {
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

/**
 * Database validator utility class
 */
export class DatabaseValidator<T> {
  constructor(private schema: z.ZodType<T, any, any>) {}

  /**
   * Parse single row with validation
   */
  parseOne(row: unknown): T {
    return this.schema.parse(row);
  }

  /**
   * Parse multiple rows with validation
   */
  parseMany(rows: unknown[]): T[] {
    return z.array(this.schema).parse(rows);
  }

  /**
   * Safe parse that returns null on error
   */
  parseOneSafe(row: unknown): T | null {
    const result = this.schema.safeParse(row);
    return result.success ? result.data : null;
  }

  /**
   * Safe parse array that filters out invalid rows
   */
  parseManySafe(rows: unknown[]): T[] {
    return rows
      .map((row) => this.parseOneSafe(row))
      .filter((item): item is T => item !== null);
  }
}

/**
 * Factory function to create validators
 */
export function createValidator<T>(schema: z.ZodType<T, any, any>) {
  return new DatabaseValidator(schema);
}

/**
 * Common validation schemas for typical database entities
 */
export const commonValidators = {
  /**
   * Standard entity with UUID, timestamps, and soft delete
   */
  baseEntity: z.object({
    id: dbSchemas.uuid,
    is_active: dbSchemas.boolean,
    created_at: dbSchemas.timestamp,
    updated_at: dbSchemas.timestamp,
  }),

  /**
   * Pagination metadata
   */
  paginationMeta: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }),
};
