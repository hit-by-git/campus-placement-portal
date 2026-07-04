import { Router } from "express";
import { Role } from "@prisma/client";
import { analyticsController } from "../controllers/analytics.controller";
import { requireAuth, requireRole } from "../middlewares/auth";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth, requireRole(Role.PLACEMENT_OFFICER));

/**
 * @openapi
 * /analytics/overview:
 *   get:
 *     summary: Placement percentage, average package and highest package (Placement Officer only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview statistics
 */
analyticsRouter.get("/overview", analyticsController.overview);

analyticsRouter.get("/applications-per-company", analyticsController.applicationsPerCompany);

analyticsRouter.get("/skill-distribution", analyticsController.skillDistribution);

/**
 * @openapi
 * /analytics/export/students:
 *   get:
 *     summary: Export all students as CSV (Placement Officer only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
analyticsRouter.get("/export/students", analyticsController.exportStudentsCsv);

analyticsRouter.get("/export/placements", analyticsController.exportPlacementsCsv);
