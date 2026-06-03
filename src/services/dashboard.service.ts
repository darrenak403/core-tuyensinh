import { db } from "@config/database";
import type {
  DashboardStats,
  QuickAction,
  RecentActivity,
} from "../types/dashboard";

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const [
      departmentsResult,
      programsResult,
      campusesResult,
      studentsResult,
      tuitionResult,
      docsResult,
    ] = await Promise.all([
      db`SELECT COUNT(*) as count FROM departments WHERE is_active = true`,
      db`SELECT COUNT(*) as count FROM programs WHERE is_active = true`,
      db`SELECT COUNT(*) as count FROM campuses WHERE is_active = true`,
      db`SELECT COUNT(*) as count FROM applications WHERE status != 'cancelled'`,
      db`SELECT COUNT(DISTINCT program_id) as count FROM progressive_tuition WHERE is_active = true`,
      db`SELECT COUNT(*) as count FROM chatbot_analytics WHERE created_at >= NOW() - INTERVAL '30 days'`,
    ]);

    return {
      totalDepartments: Number(departmentsResult[0]?.count || 0),
      totalPrograms: Number(programsResult[0]?.count || 0),
      totalCampuses: Number(campusesResult[0]?.count || 0),
      totalStudents: Number(studentsResult[0]?.count || 0),
      totalTuitionPrograms: Number(tuitionResult[0]?.count || 0),
      totalKnowledgeDocs: Number(docsResult[0]?.count || 0),
    };
  }

  async getRecentActivities(limit = 10): Promise<RecentActivity[]> {
    try {
      const result = await db`
        SELECT 
          'department_created' as type,
          id,
          name as entity_name,
          created_at as timestamp,
          'Khoa mới được tạo' as title,
          'Khoa ' || name || ' đã được thêm vào hệ thống' as description
        FROM departments 
        WHERE created_at >= NOW() - INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
          'program_updated' as type,
          id,
          name as entity_name,
          updated_at as timestamp,
          'Chương trình được cập nhật' as title,
          'Chương trình ' || name || ' đã được cập nhật' as description
        FROM programs 
        WHERE updated_at >= NOW() - INTERVAL '7 days' AND updated_at != created_at
        
        UNION ALL
        
        SELECT 
          'campus_edited' as type,
          id,
          name as entity_name,
          updated_at as timestamp,
          'Thông tin cơ sở được chỉnh sửa' as title,
          'Cơ sở ' || name || ' đã được cập nhật' as description
        FROM campuses 
        WHERE updated_at >= NOW() - INTERVAL '7 days' AND updated_at != created_at
        
        UNION ALL
        
        SELECT 
          'application_submitted' as type,
          id,
          COALESCE(student_name, 'Unknown') as entity_name,
          created_at as timestamp,
          'Đơn đăng ký mới' as title,
          'Đơn đăng ký từ ' || COALESCE(student_name, 'Unknown') || ' đã được gửi' as description
        FROM applications 
        WHERE created_at >= NOW() - INTERVAL '7 days'
        
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;

      return result.map((row: any) => ({
        id: row.id,
        type: row.type as RecentActivity["type"],
        title: row.title,
        description: row.description,
        timestamp: row.timestamp,
        entityId: row.id,
        entityName: row.entity_name,
      }));
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return [];
    }
  }

  async getAnalytics() {
    try {
      const [
        applicationsByMonthResult,
        topProgramsResult,
        campusDistributionResult,
        chatbotUsageResult,
        topIntentsResult,
      ] = await Promise.all([
        db`
          SELECT 
            TO_CHAR(created_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM applications 
          WHERE created_at >= NOW() - INTERVAL '12 months'
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY month DESC
          LIMIT 12
        `,
        db`
          SELECT 
            p.name as program_name,
            COUNT(a.id) as application_count
          FROM programs p
          LEFT JOIN applications a ON p.id = a.program_id
          WHERE p.is_active = true
          GROUP BY p.id, p.name
          ORDER BY application_count DESC
          LIMIT 10
        `,
        db`
          SELECT 
            c.name as campus_name,
            COUNT(a.id) as student_count
          FROM campuses c
          LEFT JOIN applications a ON c.id = a.campus_id
          WHERE c.is_active = true
          GROUP BY c.id, c.name
          ORDER BY student_count DESC
        `,
        db`
          SELECT 
            COUNT(*) as total_conversations,
            AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_session_duration
          FROM chatbot_conversations 
          WHERE created_at >= NOW() - INTERVAL '30 days'
        `,
        db`
          SELECT 
            intent,
            COUNT(*) as count
          FROM user_intents 
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY intent
          ORDER BY count DESC
          LIMIT 10
        `,
      ]);

      return {
        applicationsByMonth: applicationsByMonthResult.map((row: any) => ({
          month: row.month,
          count: Number(row.count),
        })),
        topPrograms: topProgramsResult.map((row: any) => ({
          programName: row.program_name,
          applicationCount: Number(row.application_count),
        })),
        campusDistribution: campusDistributionResult.map((row: any) => ({
          campusName: row.campus_name,
          studentCount: Number(row.student_count),
        })),
        chatbotUsage: {
          totalConversations: Number(
            chatbotUsageResult[0]?.total_conversations || 0
          ),
          averageSessionDuration: Number(
            chatbotUsageResult[0]?.avg_session_duration || 0
          ),
          topIntents: topIntentsResult.map((row: any) => ({
            intent: row.intent,
            count: Number(row.count),
          })),
        },
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return {
        applicationsByMonth: [],
        topPrograms: [],
        campusDistribution: [],
        chatbotUsage: {
          totalConversations: 0,
          averageSessionDuration: 0,
          topIntents: [],
        },
      };
    }
  }

  getQuickActions(): QuickAction[] {
    return [
      {
        id: "add-department",
        title: "Thêm Khoa",
        description: "Tạo khoa mới",
        icon: "building",
        route: "/departments",
        color: "blue",
      },
      {
        id: "add-program",
        title: "Thêm Chương Trình",
        description: "Tạo chương trình mới",
        icon: "graduation-cap",
        route: "/programs",
        color: "green",
      },
      {
        id: "add-campus",
        title: "Thêm Cơ Sở",
        description: "Tạo cơ sở mới",
        icon: "map-pin",
        route: "/campuses",
        color: "purple",
      },
      {
        id: "view-tuition",
        title: "Xem Học Phí",
        description: "Tra cứu học phí chương trình",
        icon: "dollar-sign",
        route: "/tuition",
        color: "green",
      },
      {
        id: "upload-document",
        title: "Tải Lên Tài Liệu",
        description: "Thêm tài liệu kiến thức",
        icon: "book-open",
        route: "/docs",
        color: "purple",
      },
      {
        id: "view-report",
        title: "Xem Báo Cáo",
        description: "Tạo báo cáo",
        icon: "users",
        route: "/reports",
        color: "orange",
      },
    ];
  }
}
