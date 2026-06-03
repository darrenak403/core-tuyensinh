import {
  getDashboard,
  getDashboardAnalytics,
  getDashboardStats,
} from "@handlers/dashboard.handler";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
  getDashboardAnalyticsRoute,
  getDashboardRoute,
  getDashboardStatsRoute,
} from "@schemas/dashboard";

const dashboardRoutes = new OpenAPIHono();

dashboardRoutes.openapi(getDashboardRoute, getDashboard);
dashboardRoutes.openapi(getDashboardStatsRoute, getDashboardStats);
dashboardRoutes.openapi(getDashboardAnalyticsRoute, getDashboardAnalytics);

export default dashboardRoutes;
