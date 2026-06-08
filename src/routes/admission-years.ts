import {
  createAdmissionYearHandler,
  deleteAdmissionYearHandler,
  getAdmissionYearsHandler,
  updateAdmissionYearHandler,
} from "@handlers/admission-years.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  admissionYearDeleteResponseSchema,
  admissionYearErrorSchema,
  admissionYearParamsSchema,
  admissionYearResponseSchema,
  admissionYearsResponseSchema,
  createAdmissionYearSchema,
  updateAdmissionYearSchema,
} from "@schemas/admission-years";

const app = new OpenAPIHono();

const getAdmissionYearsRoute = createRoute({
  method: "get",
  path: "/api/v1/admission-years",
  summary: "Get admission years",
  description: "Retrieve all admission years ordered by year descending",
  tags: ["Admission Years"],
  responses: {
    200: {
      content: { "application/json": { schema: admissionYearsResponseSchema } },
      description: "List of admission years",
    },
  },
});

const createAdmissionYearRoute = createRoute({
  method: "post",
  path: "/api/v1/admission-years",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create admission year",
  tags: ["Admission Years"],
  request: {
    body: {
      content: { "application/json": { schema: createAdmissionYearSchema } },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: admissionYearResponseSchema } },
      description: "Admission year created",
    },
    400: {
      content: { "application/json": { schema: admissionYearErrorSchema } },
      description: "Validation error",
    },
    409: {
      content: { "application/json": { schema: admissionYearErrorSchema } },
      description: "Admission year already exists",
    },
  },
});

const updateAdmissionYearRoute = createRoute({
  method: "put",
  path: "/api/v1/admission-years/{year}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update admission year",
  tags: ["Admission Years"],
  request: {
    params: admissionYearParamsSchema,
    body: {
      content: { "application/json": { schema: updateAdmissionYearSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: admissionYearResponseSchema } },
      description: "Admission year updated",
    },
    404: {
      content: { "application/json": { schema: admissionYearErrorSchema } },
      description: "Admission year not found",
    },
  },
});

const deleteAdmissionYearRoute = createRoute({
  method: "delete",
  path: "/api/v1/admission-years/{year}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete admission year",
  tags: ["Admission Years"],
  request: { params: admissionYearParamsSchema },
  responses: {
    200: {
      content: {
        "application/json": { schema: admissionYearDeleteResponseSchema },
      },
      description: "Admission year deleted",
    },
    400: {
      content: { "application/json": { schema: admissionYearErrorSchema } },
      description: "Admission year has related data",
    },
    404: {
      content: { "application/json": { schema: admissionYearErrorSchema } },
      description: "Admission year not found",
    },
  },
});

app.openapi(getAdmissionYearsRoute, getAdmissionYearsHandler);
app.openapi(createAdmissionYearRoute, createAdmissionYearHandler);
app.openapi(updateAdmissionYearRoute, updateAdmissionYearHandler);
app.openapi(deleteAdmissionYearRoute, deleteAdmissionYearHandler);

export default app;
