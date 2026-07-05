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

/**
 * @openapi
 * /analytics/applications-per-company:
 *   get:
 *     summary: Application count per company (Placement Officer only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications per company
 */
analyticsRouter.get("/applications-per-company", analyticsController.applicationsPerCompany);

/**
 * @openapi
 * /analytics/skill-distribution:
 *   get:
 *     summary: Student skill distribution across the platform (Placement Officer only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skill distribution
 */
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

/**
 * @openapi
 * /analytics/export/placements:
 *   get:
 *     summary: Export accepted placements as CSV (Placement Officer only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
analyticsRouter.get("/export/placements", analyticsController.exportPlacementsCsv);
