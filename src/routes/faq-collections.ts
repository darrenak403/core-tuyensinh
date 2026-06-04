import {
  addFaqCollectionItemsHandler,
  createFaqCollectionHandler,
  deleteFaqCollectionHandler,
  getFaqCollectionHandler,
  getFaqCollectionsHandler,
  removeFaqCollectionItemHandler,
  transitionFaqCollectionStatusHandler,
  updateFaqCollectionHandler,
} from "@handlers/faq-collections.handler";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { authMiddleware, requireAdmin } from "@middleware/auth";
import {
  addCollectionItemsResponseSchema,
  addCollectionItemsSchema,
  collectionItemParamSchema,
  createFaqCollectionSchema,
  deleteResponseSchema,
  faqCollectionResponseSchema,
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

const createFaqCollectionRoute = createRoute({
  method: "post",
  path: "/api/v1/faq/collections",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Create FAQ collection",
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

const addFaqCollectionItemsRoute = createRoute({
  method: "post",
  path: "/api/v1/faq/collections/{id}/items",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Add answers to a collection",
  tags: ["FAQ Collections"],
  request: {
    params: uuidParamSchema,
    body: { content: { "application/json": { schema: addCollectionItemsSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: addCollectionItemsResponseSchema } }, description: "Items added" },
    404: { content: { "application/json": { schema: faqErrorSchema } }, description: "Collection not found" },
  },
});

const removeFaqCollectionItemRoute = createRoute({
  method: "delete",
  path: "/api/v1/faq/collections/{id}/items/{answerId}",
  middleware: [authMiddleware, requireAdmin] as const,
  summary: "Remove an answer from a collection",
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
app.openapi(createFaqCollectionRoute, createFaqCollectionHandler);
app.openapi(updateFaqCollectionRoute, updateFaqCollectionHandler);
app.openapi(transitionFaqCollectionStatusRoute, transitionFaqCollectionStatusHandler);
app.openapi(addFaqCollectionItemsRoute, addFaqCollectionItemsHandler);
app.openapi(removeFaqCollectionItemRoute, removeFaqCollectionItemHandler);
app.openapi(deleteFaqCollectionRoute, deleteFaqCollectionHandler);

export default app;
