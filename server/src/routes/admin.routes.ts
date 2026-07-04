import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { adminController } from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { paginationQuerySchema } from "../validators/common.validator";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(Role.PLACEMENT_OFFICER));

const userIdParamsSchema = z.object({ userId: z.string().uuid() });

/**
 * @openapi
 * /admin/recruiters/pending:
 *   get:
 *     summary: List recruiters awaiting approval
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of pending recruiters
 */
adminRouter.get(
  "/recruiters/pending",
  validate({ query: paginationQuerySchema }),
  adminController.listPendingRecruiters
);

/**
 * @openapi
 * /admin/recruiters/{userId}/approve:
 *   patch:
 *     summary: Approve a pending recruiter account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recruiter approved
 */
adminRouter.patch(
  "/recruiters/:userId/approve",
  validate({ params: userIdParamsSchema }),
  adminController.approveRecruiter
);
