import { Router } from "express";
import { Role } from "@prisma/client";
import { studentController } from "../controllers/student.controller";
import { resumeController } from "../controllers/resume.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { uploadPdf } from "../middlewares/upload";
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

/**
 * @openapi
 * /students/me/skills:
 *   post:
 *     summary: Add or update a skill on the logged-in student's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Skill added
 */
studentRouter.post(
  "/me/skills",
  requireRole(Role.STUDENT),
  validate({ body: addSkillSchema }),
  studentController.addSkill
);

/**
 * @openapi
 * /students/me/skills/{skillId}:
 *   delete:
 *     summary: Remove a skill from the logged-in student's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Skill removed
 */
studentRouter.delete(
  "/me/skills/:skillId",
  requireRole(Role.STUDENT),
  validate({ params: skillParamsSchema }),
  studentController.removeSkill
);

/**
 * @openapi
 * /students/me/certificates:
 *   post:
 *     summary: Add a certificate to the logged-in student's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Certificate added
 */
studentRouter.post(
  "/me/certificates",
  requireRole(Role.STUDENT),
  validate({ body: certificateSchema }),
  studentController.addCertificate
);

/**
 * @openapi
 * /students/me/certificates/{certificateId}:
 *   patch:
 *     summary: Update one of the logged-in student's certificates
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Certificate updated
 */
studentRouter.patch(
  "/me/certificates/:certificateId",
  requireRole(Role.STUDENT),
  validate({ params: certificateParamsSchema, body: certificateSchema.partial() }),
  studentController.updateCertificate
);

/**
 * @openapi
 * /students/me/certificates/{certificateId}:
 *   delete:
 *     summary: Delete one of the logged-in student's certificates
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Certificate deleted
 */
studentRouter.delete(
  "/me/certificates/:certificateId",
  requireRole(Role.STUDENT),
  validate({ params: certificateParamsSchema }),
  studentController.deleteCertificate
);

/**
 * @openapi
 * /students/me/resume:
 *   post:
 *     summary: Upload and parse the logged-in student's resume (PDF)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Resume uploaded and parsed
 */
studentRouter.post(
  "/me/resume",
  requireRole(Role.STUDENT),
  uploadPdf("resume"),
  resumeController.upload
);

/**
 * @openapi
 * /students/me/resume:
 *   get:
 *     summary: Get the logged-in student's most recently uploaded resume
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest resume record
 *       404:
 *         description: No resume uploaded yet
 */
studentRouter.get("/me/resume", requireRole(Role.STUDENT), resumeController.getLatest);
