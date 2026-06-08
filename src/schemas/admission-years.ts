import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const currentYear = new Date().getFullYear();
const minAllowedYear = currentYear - 10;
const maxAllowedYear = currentYear + 5;

export const admissionYearNumberSchema = z.coerce
  .number({
    required_error: "year là bắt buộc",
    invalid_type_error: "year phải là số nguyên",
  })
  .int("year phải là số nguyên")
  .min(1000, "year phải là số có 4 chữ số")
  .max(9999, "year phải là số có 4 chữ số")
  .refine(
    (year) => year >= minAllowedYear && year <= maxAllowedYear,
    `year nằm ngoài khoảng cho phép (${minAllowedYear}-${maxAllowedYear})`
  );

export const admissionYearReferenceSchema = z.coerce
  .number({
    invalid_type_error: "admission_year phải là số nguyên",
  })
  .int("admission_year phải là số nguyên")
  .min(1000, "admission_year phải là số có 4 chữ số")
  .max(9999, "admission_year phải là số có 4 chữ số");

export const admissionYearSchema = z.object({
  year: z.number().int(),
  label: z.string(),
  is_active: z.boolean(),
  created_at: z.union([z.string(), z.date()]),
});

export const createAdmissionYearSchema = z.object({
  year: admissionYearNumberSchema,
  label: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
});

export const updateAdmissionYearSchema = z.object({
  label: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
});

export const admissionYearParamsSchema = z.object({
  year: admissionYearNumberSchema,
});

export const admissionYearsResponseSchema = z.object({
  data: z.array(admissionYearSchema),
});

export const admissionYearResponseSchema = z.object({
  data: admissionYearSchema,
});

export const admissionYearDeleteResponseSchema = z.object({
  message: z.string(),
});

export const admissionYearErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export function parseAdmissionYearQuery(
  value: string | undefined
): number | undefined {
  if (value === undefined || value === "") return undefined;
  const parsed = admissionYearReferenceSchema.safeParse(value);
  if (!parsed.success) {
    throw new HTTPException(400, {
      message: "admission_year phải là số nguyên",
    });
  }
  return parsed.data;
}
