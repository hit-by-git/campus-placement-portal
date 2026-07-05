import { Router } from "express";
import { Role } from "@prisma/client";
import { applicationController } from "../controllers/application.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  applicationParamsSchema,
  createApplicationSchema,
  listApplicationsQuerySchema,
  updateApplicationStatusSchema,
} from "../validators/application.validator";

export const applicationRouter = Router();

applicationRouter.use(requireAuth);

/**
 * @openapi
 * /applications:
 *   post:
 *     summary: Apply to a drive (Student only, gated by the eligibility engine)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Application submitted
 */
applicationRouter.post(
  "/",
  requireRole(Role.STUDENT),
  validate({ body: createApplicationSchema }),
  applicationController.apply
);

/**
 * @openapi
 * /applications/me:
 *   get:
 *     summary: List the logged-in student's own applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of applications
 */
applicationRouter.get(
  "/me",
  requireRole(Role.STUDENT),
  validate({ query: listApplicationsQuerySchema }),
  applicationController.listMine
);

/**
 * @openapi
 * /applications/{applicationId}:
 *   get:
 *     summary: Get an application (owning student, or the drive's recruiter/Placement Officer)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Application details, including interviews and offer
 */
applicationRouter.get(
  "/:applicationId",
  validate({ params: applicationParamsSchema }),
  applicationController.getById
);

/**
 * @openapi
 * /applications/{applicationId}/withdraw:
 *   patch:
 *     summary: Withdraw an application (Student only, before an offer is made)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Application withdrawn
 */
applicationRouter.patch(
  "/:applicationId/withdraw",
  requireRole(Role.STUDENT),
  validate({ params: applicationParamsSchema }),
  applicationController.withdraw
);

/**
 * @openapi
 * /applications/{applicationId}/status:
 *   patch:
 *     summary: Shortlist, move to interview, or reject an application (owning Recruiter or Placement Officer)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Application status updated
 */
applicationRouter.patch(
  "/:applicationId/status",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ params: applicationParamsSchema, body: updateApplicationStatusSchema }),
  applicationController.updateStatus
);
