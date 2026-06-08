import {
  addFaqCollectionItemsHandler,
  copyFaqCollectionHandler,
  createFaqCollectionHandler,
  deleteFaqCollectionHandler,
  exportFaqCollectionCsvHandler,
  exportFaqCollectionExcelHandler,
  exportFaqCollectionMarkdownHandler,
  getFaqCollectionDetailHandler,
  getFaqCollectionHandler,
  getFaqCollectionsHandler,
  removeFaqCollectionItemHandler,
  transitionFaqCollectionStatusHandler,
  updateFaqCollectionHandler,
} from "@handlers/faq-collections.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import { z } from "zod";
import {
  addCollectionItemsResponseSchema,
  addCollectionItemsSchema,
  collectionItemParamSchema,
  copyCollectionSchema,
  createFaqCollectionSchema,
  deleteResponseSchema,
  faqCollectionResponseSchema,
  faqCollectionDetailResponseSchema,
  faqCollectionsQuerySchema,
  faqCollectionsResponseSchema,
  faqErrorSchema,
  transitionCollectionStatusSchema,
  uuidParamSchema,
  updateFaqCollectionSchema,
} from "@schemas/faq";

const app = new OpenAPIHono();

const getFaqCollectionsRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/collections",
  summary: "List FAQ collections",
  tags: ["FAQ Collections"],
  request: { query: faqCollectionsQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: faqCollectionsResponseSchema } }, description: "Paginated list" },
  },
});

const getFaqCollectionRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/collections/{id}",
  summary: "Get FAQ collection by ID",
  tags: ["FAQ Collections"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: faqCollectionResponseSchema } }, description: "Collection" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const getFaqCollectionDetailRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/collections/{id}/detail",
  middleware: [authMiddleware] as const,
  summary: "Get FAQ collection detail grouped by topic and sub-topic",
  description: "Returns the question set with topics, sub-topics, questions, answers, year, and campus assignments.",
  tags: ["FAQ Collections"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: faqCollectionDetailResponseSchema } }, description: "Grouped collection detail" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const exportFaqCollectionCsvRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/collections/{id}/export.csv",
  middleware: [authMiddleware] as const,
  summary: "Export FAQ collection questions and answers as CSV",
  description: "Exports topic, sub-topic, question, aliases, answers with campus, year, campus, and approval statuses. CSV is UTF-8 BOM and can be opened by Excel.",
  tags: ["FAQ Collections"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "text/csv": { schema: z.string() } }, description: "CSV export for Excel" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const exportFaqCollectionExcelRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/collections/{id}/export.xls",
  middleware: [authMiddleware] as const,
  summary: "Export FAQ collection as formatted Excel",
  description: "Exports an Excel-compatible .xls file with title, column widths, styled header, wrapped text, and table borders.",
  tags: ["FAQ Collections"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/vnd.ms-excel": { schema: z.string() } }, description: "Formatted Excel export" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const exportFaqCollectionMarkdownRoute = createRoute({
  method: "get",
  path: "/api/v1/faq/collections/{id}/export.md",
  middleware: [authMiddleware] as const,
  summary: "Export FAQ collection as Markdown records",
  description: "Exports one FAQ Record per question-answer-campus row using Record ID FAQ<YEAR><CAMPUS><TOPIC><SEQ>.",
  tags: ["FAQ Collections"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "text/markdown": { schema: z.string() } }, description: "Markdown export" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const createFaqCollectionRoute = createRoute({
  method: "post",
  path: "/api/v1/faq/collections",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create FAQ collection",
  description: "Create a new collection for a specific admission year",
  tags: ["FAQ Collections"],
  request: { body: { content: { "application/json": { schema: createFaqCollectionSchema } } } },
  responses: {
    201: { content: { "application/json": { schema: faqCollectionResponseSchema } }, description: "Created" },
  },
});

const updateFaqCollectionRoute = createRoute({
  method: "put",
  path: "/api/v1/faq/collections/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Update FAQ collection",
  tags: ["FAQ Collections"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: updateFaqCollectionSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: faqCollectionResponseSchema } }, description: "Updated" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const transitionFaqCollectionStatusRoute = createRoute({
  method: "patch",
  path: "/api/v1/faq/collections/{id}/status",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Transition collection status",
  description: "Workflow: draft→published→archived",
  tags: ["FAQ Collections"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: transitionCollectionStatusSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: faqCollectionResponseSchema } }, description: "Status updated" },
    400: { content: { "application/json": { schema: faqErrorSchema } }, description: "Invalid transition" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const copyFaqCollectionRoute = createRoute({
  method: "post",
  path: "/api/v1/faq/collections/{id}/copy",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Copy collection to a new admission year",
  description: "Creates a new draft collection with the same questions. Useful for cloning 2026 → 2027.",
  tags: ["FAQ Collections"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: copyCollectionSchema } } },
  },
  responses: {
    201: { content: { "application/json": { schema: faqCollectionResponseSchema } }, description: "New collection created" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Source collection not found" },
  },
});

const addFaqCollectionItemsRoute = createRoute({
  method: "post",
  path: "/api/v1/faq/collections/{id}/items",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Add questions to a collection",
  tags: ["FAQ Collections"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: addCollectionItemsSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: addCollectionItemsResponseSchema } }, description: "Items added" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Collection or question not found" },
  },
});

const removeFaqCollectionItemRoute = createRoute({
  method: "delete",
  path: "/api/v1/faq/collections/{id}/items/{questionId}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Remove a question from a collection",
  tags: ["FAQ Collections"],
  request: { params: collectionItemParamSchema },
  responses: {
    200: { content: { "application/json": { schema: deleteResponseSchema } }, description: "Item removed" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

const deleteFaqCollectionRoute = createRoute({
  method: "delete",
  path: "/api/v1/faq/collections/{id}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Delete FAQ collection",
  tags: ["FAQ Collections"],
  request: { params: uuidParamSchema },
  responses: {
    200: { content: { "application/json": { schema: deleteResponseSchema } }, description: "Deleted" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Not found" },
  },
});

app.openapi(getFaqCollectionsRoute, getFaqCollectionsHandler);
app.openapi(getFaqCollectionRoute, getFaqCollectionHandler);
app.openapi(getFaqCollectionDetailRoute, getFaqCollectionDetailHandler);
app.openapi(exportFaqCollectionCsvRoute, exportFaqCollectionCsvHandler);
app.openapi(exportFaqCollectionExcelRoute, exportFaqCollectionExcelHandler);
app.openapi(exportFaqCollectionMarkdownRoute, exportFaqCollectionMarkdownHandler);
app.openapi(createFaqCollectionRoute, createFaqCollectionHandler);
app.openapi(updateFaqCollectionRoute, updateFaqCollectionHandler);
app.openapi(transitionFaqCollectionStatusRoute, transitionFaqCollectionStatusHandler);
app.openapi(copyFaqCollectionRoute, copyFaqCollectionHandler);
app.openapi(addFaqCollectionItemsRoute, addFaqCollectionItemsHandler);
app.openapi(removeFaqCollectionItemRoute, removeFaqCollectionItemHandler);
app.openapi(deleteFaqCollectionRoute, deleteFaqCollectionHandler);

export default app;
