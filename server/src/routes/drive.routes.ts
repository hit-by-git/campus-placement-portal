import { Router } from "express";
import { Role } from "@prisma/client";
import { driveController } from "../controllers/drive.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
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

driveRouter.get("/:driveId", validate({ params: driveParamsSchema }), driveController.getById);

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
