import { Router } from "express";
import { Role } from "@prisma/client";
import { recommendationController } from "../controllers/recommendation.controller";
import { requireAuth, requireRole } from "../middlewares/auth";

export const recommendationRouter = Router();

/**
 * @openapi
 * /recommendations/drives:
 *   get:
 *     summary: Skill-based drive recommendations for the logged-in student
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranked list of recommended drives
 */
recommendationRouter.get(
  "/drives",
  requireAuth,
  requireRole(Role.STUDENT),
  recommendationController.recommendDrives
);
