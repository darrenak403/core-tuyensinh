import {
  createFaqTopicHandler,
  deleteFaqTopicHandler,
  getFaqTopicHandler,
  getFaqTopicsHandler,
  updateFaqTopicHandler,
} from "@handlers/faq-topics.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  createFaqTopicSchema,
  deleteResponseSchema,
  faqErrorSchema,
  faqTopicResponseSchema,
  faqTopicsQuerySchema,
  faqTopicsResponseSchema,
  uuidParamSchema,
  updateFaqTopicSchema,
} from "@schemas/faq";

const app = new OpenAPIHono();

const getFaqTopicsRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/topics",
  summary: "List FAQ topics",
  tags: ["FAQ"],
  request: { query: faqTopicsQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: faqTopicsResponseSchema } }, description: "Paginated list of FAQ topics" },
  },
});

const getFaqTopicRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/topics/{id}",
  summary: "Get FAQ topic by ID",
  tags: ["FAQ"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: faqTopicResponseSchema } }, description: "FAQ topic" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const createFaqTopicRoute = createRoute({
  method: "post",
  path: "/api/v1/faq/topics",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create FAQ topic",
  tags: ["FAQ"],
  request: { body: { content: { "application/json": { schema: createFaqTopicSchema } } } },
  responses: {
    201: { content: { "application/json": { schema: faqTopicResponseSchema } }, description: "Created" },
    409: { content: { "application/json": { schema: faqErrorSchema } }, description: "Code already exists" },
  },
});

const updateFaqTopicRoute = createRoute({
  method: "put",
  path: "/api/v1/faq/topics/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update FAQ topic",
  tags: ["FAQ"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: updateFaqTopicSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: faqTopicResponseSchema } }, description: "Updated" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const deleteFaqTopicRoute = createRoute({
  method: "delete",
  path: "/api/v1/faq/topics/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete FAQ topic",
  tags: ["FAQ"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: deleteResponseSchema } }, description: "Deleted" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

app.openapi(getFaqTopicsRoute, getFaqTopicsHandler);
app.openapi(getFaqTopicRoute, getFaqTopicHandler);
app.openapi(createFaqTopicRoute, createFaqTopicHandler);
app.openapi(updateFaqTopicRoute, updateFaqTopicHandler);
app.openapi(deleteFaqTopicRoute, deleteFaqTopicHandler);

export default app;
