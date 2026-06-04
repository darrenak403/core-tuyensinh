import {
  createFaqSubTopicHandler,
  deleteFaqSubTopicHandler,
  getFaqSubTopicHandler,
  getFaqSubTopicsHandler,
  updateFaqSubTopicHandler,
} from "@handlers/faq-sub-topics.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  createFaqSubTopicSchema,
  deleteResponseSchema,
  faqErrorSchema,
  faqSubTopicResponseSchema,
  faqSubTopicsQuerySchema,
  faqSubTopicsResponseSchema,
  topicIdParamSchema,
  uuidParamSchema,
  updateFaqSubTopicSchema,
} from "@schemas/faq";

const app = new OpenAPIHono();

const getFaqSubTopicsByTopicRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/topics/{topicId}/sub-topics",
  summary: "List sub topics by topic",
  tags: ["FAQ"],
  request: {
    params: topicIdParamSchema,
    query: faqSubTopicsQuerySchema,
  },
  responses: {
    200: { content: { "application/json": { schema: faqSubTopicsResponseSchema } }, description: "Sub topics for a topic" },
  },
});

const getFaqSubTopicsRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/sub-topics",
  summary: "List all FAQ sub topics",
  tags: ["FAQ"],
  request: { query: faqSubTopicsQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: faqSubTopicsResponseSchema } }, description: "Paginated list" },
  },
});

const getFaqSubTopicRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/sub-topics/{id}",
  summary: "Get FAQ sub topic by ID",
  tags: ["FAQ"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: faqSubTopicResponseSchema } }, description: "Sub topic" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const createFaqSubTopicRoute = createRoute({
  method: "post",
  path: "/api/v1/faq/sub-topics",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create FAQ sub topic",
  tags: ["FAQ"],
  request: { body: { content: { "application/json": { schema: createFaqSubTopicSchema } } } },
  responses: {
    201: { content: { "application/json": { schema: faqSubTopicResponseSchema } }, description: "Created" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Topic not found" },
  },
});

const updateFaqSubTopicRoute = createRoute({
  method: "put",
  path: "/api/v1/faq/sub-topics/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update FAQ sub topic",
  tags: ["FAQ"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: updateFaqSubTopicSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: faqSubTopicResponseSchema } }, description: "Updated" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const deleteFaqSubTopicRoute = createRoute({
  method: "delete",
  path: "/api/v1/faq/sub-topics/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete FAQ sub topic",
  tags: ["FAQ"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: deleteResponseSchema } }, description: "Deleted" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

app.openapi(getFaqSubTopicsByTopicRoute, getFaqSubTopicsHandler);
app.openapi(getFaqSubTopicsRoute, getFaqSubTopicsHandler);
app.openapi(getFaqSubTopicRoute, getFaqSubTopicHandler);
app.openapi(createFaqSubTopicRoute, createFaqSubTopicHandler);
app.openapi(updateFaqSubTopicRoute, updateFaqSubTopicHandler);
app.openapi(deleteFaqSubTopicRoute, deleteFaqSubTopicHandler);

export default app;
