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

applicationRouter.get(
  "/me",
  requireRole(Role.STUDENT),
  validate({ query: listApplicationsQuerySchema }),
  applicationController.listMine
);

applicationRouter.get(
  "/:applicationId",
  validate({ params: applicationParamsSchema }),
  applicationController.getById
);

applicationRouter.patch(
  "/:applicationId/withdraw",
  requireRole(Role.STUDENT),
  validate({ params: applicationParamsSchema }),
  applicationController.withdraw
);

applicationRouter.patch(
  "/:applicationId/status",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ params: applicationParamsSchema, body: updateApplicationStatusSchema }),
  applicationController.updateStatus
);
