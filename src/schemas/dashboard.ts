import { createRoute, z } from "@hono/zod-openapi";
import { DashboardResponseSchema } from "../types/dashboard";

// Response schemas
export const dashboardResponseSchema = DashboardResponseSchema;
export const dashboardStatsResponseSchema = z.object({
  stats: z.object({
    totalDepartments: z.number(),
    totalPrograms: z.number(),
    totalCampuses: z.number(),
    totalStudents: z.number(),
    totalTuitionPrograms: z.number(),
    totalKnowledgeDocs: z.number(),
  }),
});

export const dashboardAnalyticsResponseSchema = z.object({
  analytics: z.object({
    applicationsByMonth: z.array(
      z.object({
        month: z.string(),
        count: z.number(),
      })
    ),
    topPrograms: z.array(
      z.object({
        programName: z.string(),
        applicationCount: z.number(),
      })
    ),
    campusDistribution: z.array(
      z.object({
        campusName: z.string(),
        studentCount: z.number(),
      })
    ),
    chatbotUsage: z.object({
      totalConversations: z.number(),
      averageSessionDuration: z.number(),
      topIntents: z.array(
        z.object({
          intent: z.string(),
          count: z.number(),
        })
      ),
    }),
  }),
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    timestamp: z.string(),
  }),
});

export const getDashboardRoute = createRoute({
  method: "get",
  path: "/dashboard",
  tags: ["Dashboard"],
  summary: "Get dashboard statistics and overview",
  description:
    "Retrieve comprehensive dashboard data including statistics, recent activities, and quick actions",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: dashboardResponseSchema,
        },
      },
      description: "Dashboard data retrieved successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const getDashboardStatsRoute = createRoute({
  method: "get",
  path: "/dashboard/stats",
  tags: ["Dashboard"],
  summary: "Get dashboard statistics only",
  description: "Retrieve only the statistics data for the dashboard",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: dashboardStatsResponseSchema,
        },
      },
      description: "Dashboard statistics retrieved successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const getDashboardAnalyticsRoute = createRoute({
  method: "get",
  path: "/dashboard/analytics",
  tags: ["Dashboard"],
  summary: "Get dashboard analytics and trends",
  description:
    "Retrieve analytics data including trends, charts, and performance metrics",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: dashboardAnalyticsResponseSchema,
        },
      },
      description: "Dashboard analytics retrieved successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});
