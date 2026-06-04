import {
  createFaqQuestionHandler,
  deleteFaqQuestionHandler,
  getFaqQuestionHandler,
  getFaqQuestionsHandler,
  transitionFaqQuestionStatusHandler,
  updateFaqQuestionHandler,
} from "@handlers/faq-questions.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  createFaqQuestionSchema,
  deleteResponseSchema,
  faqErrorSchema,
  faqQuestionResponseSchema,
  faqQuestionsQuerySchema,
  faqQuestionsResponseSchema,
  transitionQuestionStatusSchema,
  uuidParamSchema,
  updateFaqQuestionSchema,
} from "@schemas/faq";

const app = new OpenAPIHono();

const getFaqQuestionsRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/questions",
  middleware: [authMiddleware] as const,
  summary: "List FAQ questions",
  tags: ["FAQ"],
  request: { query: faqQuestionsQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: faqQuestionsResponseSchema } }, description: "Paginated list" },
  },
});

const getFaqQuestionRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/questions/{id}",
  middleware: [authMiddleware] as const,
  summary: "Get FAQ question by ID",
  tags: ["FAQ"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: faqQuestionResponseSchema } }, description: "Question" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const createFaqQuestionRoute = createRoute({
  method: "post",
  path: "/api/v1/faq/questions",
  middleware: [authMiddleware] as const,
  summary: "Create FAQ question",
  tags: ["FAQ"],
  request: { body: { content: { "application/json": { schema: createFaqQuestionSchema } } } },
  responses: {
    201: { content: { "application/json": { schema: faqQuestionResponseSchema } }, description: "Created" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Sub topic not found" },
  },
});

const updateFaqQuestionRoute = createRoute({
  method: "put",
  path: "/api/v1/faq/questions/{id}",
  middleware: [authMiddleware] as const,
  summary: "Update FAQ question content",
  tags: ["FAQ"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: updateFaqQuestionSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: faqQuestionResponseSchema } }, description: "Updated" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const transitionFaqQuestionStatusRoute = createRoute({
  method: "patch",
  path: "/api/v1/faq/questions/{id}/status",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Transition question status",
  description: "Workflow: new→approved→published | new→rejected | approved→deleted",
  tags: ["FAQ"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: transitionQuestionStatusSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: faqQuestionResponseSchema } }, description: "Status updated" },
    400: { content: { "application/json": { schema: faqErrorSchema } }, description: "Invalid transition" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const deleteFaqQuestionRoute = createRoute({
  method: "delete",
  path: "/api/v1/faq/questions/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete FAQ question",
  tags: ["FAQ"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: deleteResponseSchema } }, description: "Deleted" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

app.openapi(getFaqQuestionsRoute, getFaqQuestionsHandler);
app.openapi(getFaqQuestionRoute, getFaqQuestionHandler);
app.openapi(createFaqQuestionRoute, createFaqQuestionHandler);
app.openapi(updateFaqQuestionRoute, updateFaqQuestionHandler);
app.openapi(transitionFaqQuestionStatusRoute, transitionFaqQuestionStatusHandler);
app.openapi(deleteFaqQuestionRoute, deleteFaqQuestionHandler);

export default app;
