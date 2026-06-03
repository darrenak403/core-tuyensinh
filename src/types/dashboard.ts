import { z } from "zod";

export const DashboardStatsSchema = z.object({
  totalDepartments: z.number(),
  totalPrograms: z.number(),
  totalCampuses: z.number(),
  totalStudents: z.number(),
  totalTuitionPrograms: z.number(),
  totalKnowledgeDocs: z.number(),
});

export const RecentActivitySchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    "department_created",
    "program_updated",
    "campus_edited",
    "application_submitted",
    "tuition_updated",
  ]),
  title: z.string(),
  description: z.string(),
  timestamp: z.string().datetime(),
  entityId: z.string().uuid().optional(),
  entityName: z.string().optional(),
});

export const QuickActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  route: z.string(),
  color: z.string(),
});

export const DashboardResponseSchema = z.object({
  stats: DashboardStatsSchema,
  recentActivities: z.array(RecentActivitySchema),
  quickActions: z.array(QuickActionSchema),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type RecentActivity = z.infer<typeof RecentActivitySchema>;
export type QuickAction = z.infer<typeof QuickActionSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
