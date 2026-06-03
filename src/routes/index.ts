import type { OpenAPIHono } from "@hono/zod-openapi";
import admissionMethodsRoutes from "@routes/admission-methods";
import authRoutes from "@routes/auth/auth";
import campusesRoutes from "@routes/campuses";
import dashboardRoutes from "@routes/dashboard";
import departmentsRoutes from "@routes/departments";
import docsRoutes from "@routes/docs";
import healthRoutes from "@routes/health";
import programsRoutes from "@routes/programs";
import scholarshipsRoutes from "@routes/scholarships";
import tuitionRoutes from "@routes/tuition";
import usersRoutes from "@routes/users";

/**
 * Aggregate all API routes
 */
export function setupRoutes(app: OpenAPIHono) {
  // Documentation routes (/, /docs, /info, /openapi.json)
  app.route("/", docsRoutes);

  // Health check routes
  app.route("/", healthRoutes);

  // Authentication routes
  app.route("/", authRoutes);

  // Departments routes
  app.route("/", departmentsRoutes);

  // Programs routes
  app.route("/", programsRoutes);

  // Campuses routes
  app.route("/", campusesRoutes);

  // Tuition routes
  app.route("/", tuitionRoutes);

  // Dashboard routes
  app.route("/", dashboardRoutes);

  // Scholarships routes
  app.route("/", scholarshipsRoutes);

  // Admission Methods routes
  app.route("/", admissionMethodsRoutes);

  // Users routes
  app.route("/", usersRoutes);

  return app;
}
