import { Router } from "express";
import { Role } from "@prisma/client";
import { studentController } from "../controllers/student.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  addSkillSchema,
  certificateParamsSchema,
  certificateSchema,
  listStudentsQuerySchema,
  skillParamsSchema,
  updateStudentProfileSchema,
} from "../validators/student.validator";

export const studentRouter = Router();

studentRouter.use(requireAuth);

/**
 * @openapi
 * /students:
 *   get:
 *     summary: List students with search/filter/pagination (Placement Officer only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of students
 */
studentRouter.get(
  "/",
  requireRole(Role.PLACEMENT_OFFICER),
  validate({ query: listStudentsQuerySchema }),
  studentController.list
);

/**
 * @openapi
 * /students/me:
 *   get:
 *     summary: Get the logged-in student's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile
 */
studentRouter.get("/me", requireRole(Role.STUDENT), studentController.getMe);

/**
 * @openapi
 * /students/me:
 *   patch:
 *     summary: Update the logged-in student's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
studentRouter.patch(
  "/me",
  requireRole(Role.STUDENT),
  validate({ body: updateStudentProfileSchema }),
  studentController.updateMe
);

studentRouter.post(
  "/me/skills",
  requireRole(Role.STUDENT),
  validate({ body: addSkillSchema }),
  studentController.addSkill
);

studentRouter.delete(
  "/me/skills/:skillId",
  requireRole(Role.STUDENT),
  validate({ params: skillParamsSchema }),
  studentController.removeSkill
);

studentRouter.post(
  "/me/certificates",
  requireRole(Role.STUDENT),
  validate({ body: certificateSchema }),
  studentController.addCertificate
);

studentRouter.patch(
  "/me/certificates/:certificateId",
  requireRole(Role.STUDENT),
  validate({ params: certificateParamsSchema, body: certificateSchema.partial() }),
  studentController.updateCertificate
);

studentRouter.delete(
  "/me/certificates/:certificateId",
  requireRole(Role.STUDENT),
  validate({ params: certificateParamsSchema }),
  studentController.deleteCertificate
);
