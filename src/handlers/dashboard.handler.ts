import { DashboardService } from "@services/dashboard.service";
import type { Context } from "hono";

const dashboardService = new DashboardService();

export const getDashboard = async (c: Context) => {
  const [stats, recentActivities, quickActions] = await Promise.all([
    dashboardService.getStats(),
    dashboardService.getRecentActivities(10),
    Promise.resolve(dashboardService.getQuickActions()),
  ]);

  return c.json(
    {
      stats,
      recentActivities,
      quickActions,
    },
    200
  );
};

export const getDashboardStats = async (c: Context) => {
  const stats = await dashboardService.getStats();

  return c.json(
    {
      stats,
    },
    200
  );
};

export const getDashboardAnalytics = async (c: Context) => {
  const analytics = await dashboardService.getAnalytics();

  return c.json(
    {
      analytics,
    },
    200
  );
};
