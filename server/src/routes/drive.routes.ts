import { Router } from "express";
import { Role } from "@prisma/client";
import { driveController } from "../controllers/drive.controller";
import { applicationController } from "../controllers/application.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { paginationQuerySchema } from "../validators/common.validator";
import { listApplicationsQuerySchema } from "../validators/application.validator";
import {
  createDriveSchema,
  driveParamsSchema,
  listDrivesQuerySchema,
  updateDriveSchema,
} from "../validators/drive.validator";

export const driveRouter = Router();

driveRouter.use(requireAuth);

/**
 * @openapi
 * /drives:
 *   get:
 *     summary: List drives (search/filter/paginate)
 *     tags: [Drives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of drives
 */
driveRouter.get("/", validate({ query: listDrivesQuerySchema }), driveController.list);

/**
 * @openapi
 * /drives/eligible:
 *   get:
 *     summary: List drives the logged-in student is currently eligible for
 *     tags: [Drives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of eligible drives
 */
driveRouter.get(
  "/eligible",
  requireRole(Role.STUDENT),
  validate({ query: paginationQuerySchema }),
  driveController.listEligible
);

driveRouter.get("/:driveId", validate({ params: driveParamsSchema }), driveController.getById);

driveRouter.get(
  "/:driveId/eligibility",
  requireRole(Role.STUDENT),
  validate({ params: driveParamsSchema }),
  driveController.checkEligibility
);

/**
 * @openapi
 * /drives/{driveId}/applicants:
 *   get:
 *     summary: List applicants for a drive (owning Recruiter or Placement Officer)
 *     tags: [Drives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of applications for the drive
 */
driveRouter.get(
  "/:driveId/applicants",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ params: driveParamsSchema, query: listApplicationsQuerySchema }),
  applicationController.listForDrive
);

/**
 * @openapi
 * /drives:
 *   post:
 *     summary: Create a placement drive (Recruiter for own company, or Placement Officer)
 *     tags: [Drives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Drive created
 */
driveRouter.post(
  "/",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ body: createDriveSchema }),
  driveController.create
);

driveRouter.patch(
  "/:driveId",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ params: driveParamsSchema, body: updateDriveSchema }),
  driveController.update
);

driveRouter.delete(
  "/:driveId",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ params: driveParamsSchema }),
  driveController.remove
);
