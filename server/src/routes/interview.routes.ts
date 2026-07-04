import { Router } from "express";
import { Role } from "@prisma/client";
import { interviewController } from "../controllers/interview.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  interviewParamsSchema,
  scheduleInterviewSchema,
  updateInterviewSchema,
} from "../validators/interview.validator";

export const interviewRouter = Router();

interviewRouter.use(requireAuth, requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER));

/**
 * @openapi
 * /interviews:
 *   post:
 *     summary: Schedule an interview for an application
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Interview scheduled
 */
interviewRouter.post("/", validate({ body: scheduleInterviewSchema }), interviewController.schedule);

interviewRouter.patch(
  "/:interviewId",
  validate({ params: interviewParamsSchema, body: updateInterviewSchema }),
  interviewController.update
);
