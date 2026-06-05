import {
  createFaqAnswerHandler,
  deleteFaqAnswerHandler,
  getFaqAnswerHandler,
  getFaqAnswersByQuestionHandler,
  getFaqAnswersHandler,
  searchFaqHandler,
  setFaqAnswerCampusesHandler,
  transitionFaqAnswerStatusHandler,
  updateFaqAnswerHandler,
} from "@handlers/faq-answers.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  createFaqAnswerSchema,
  deleteResponseSchema,
  faqAnswerResponseSchema,
  faqAnswersQuerySchema,
  faqAnswersResponseSchema,
  faqErrorSchema,
  faqSearchQuerySchema,
  faqSearchResponseSchema,
  questionIdParamSchema,
  setFaqAnswerCampusesSchema,
  transitionAnswerStatusSchema,
  uuidParamSchema,
  updateFaqAnswerSchema,
} from "@schemas/faq";

const app = new OpenAPIHono();

// Search (public)
const searchFaqRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/search",
  summary: "Search FAQ",
  description: "Search published FAQ answers by topic, sub-topic, campus, year, and keyword",
  tags: ["FAQ"],
  request: { query: faqSearchQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: faqSearchResponseSchema } }, description: "Search results" },
  },
});

// Public: answers by question
const getFaqAnswersByQuestionRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/questions/{questionId}/answers",
  summary: "Get published answers for a question",
  tags: ["FAQ"],
  request: { params: questionIdParamSchema, query: faqAnswersQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: faqAnswersResponseSchema } }, description: "Published answers" },
  },
});

// Admin: all answers with filters
const getFaqAnswersRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/answers",
  middleware: [authMiddleware] as const,
  summary: "List FAQ answers (all statuses)",
  tags: ["FAQ"],
  request: { query: faqAnswersQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: faqAnswersResponseSchema } }, description: "Paginated list" },
  },
});

const getFaqAnswerRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/answers/{id}",
  middleware: [authMiddleware] as const,
  summary: "Get FAQ answer by ID",
  tags: ["FAQ"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: faqAnswerResponseSchema } }, description: "Answer" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const createFaqAnswerRoute = createRoute({
  method: "post",
  path: "/api/v1/faq/answers",
  middleware: [authMiddleware] as const,
  summary: "Create FAQ answer",
  description: "campus_ids = [] or omitted means answer applies to all campuses",
  tags: ["FAQ"],
  request: { body: { content: { "application/json": { schema: createFaqAnswerSchema } } } },
  responses: {
    201: { content: { "application/json": { schema: faqAnswerResponseSchema } }, description: "Created" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Question not found" },
  },
});

const updateFaqAnswerRoute = createRoute({
  method: "put",
  path: "/api/v1/faq/answers/{id}",
  middleware: [authMiddleware] as const,
  summary: "Update FAQ answer content",
  tags: ["FAQ"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: updateFaqAnswerSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: faqAnswerResponseSchema } }, description: "Updated" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const setFaqAnswerCampusesRoute = createRoute({
  method: "put",
  path: "/api/v1/faq/answers/{id}/campuses",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Set campus assignments for an answer",
  description: "Replace all campus assignments. Pass empty array to apply to all campuses.",
  tags: ["FAQ"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: setFaqAnswerCampusesSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: faqAnswerResponseSchema } }, description: "Campus assignments updated" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const transitionFaqAnswerStatusRoute = createRoute({
  method: "patch",
  path: "/api/v1/faq/answers/{id}/status",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Transition answer status",
  description: "Workflow: new→approved | new→rejected | approved→deleted | rejected→new",
  tags: ["FAQ"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: transitionAnswerStatusSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: faqAnswerResponseSchema } }, description: "Status updated" },
    400: { content: { "application/json": { schema: faqErrorSchema } }, description: "Invalid transition" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const deleteFaqAnswerRoute = createRoute({
  method: "delete",
  path: "/api/v1/faq/answers/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete FAQ answer",
  tags: ["FAQ"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: deleteResponseSchema } }, description: "Deleted" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

app.openapi(searchFaqRoute, searchFaqHandler);
app.openapi(getFaqAnswersByQuestionRoute, getFaqAnswersByQuestionHandler);
app.openapi(getFaqAnswersRoute, getFaqAnswersHandler);
app.openapi(getFaqAnswerRoute, getFaqAnswerHandler);
app.openapi(createFaqAnswerRoute, createFaqAnswerHandler);
app.openapi(updateFaqAnswerRoute, updateFaqAnswerHandler);
app.openapi(setFaqAnswerCampusesRoute, setFaqAnswerCampusesHandler);
app.openapi(transitionFaqAnswerStatusRoute, transitionFaqAnswerStatusHandler);
app.openapi(deleteFaqAnswerRoute, deleteFaqAnswerHandler);

export default app;
