import { Router } from "express";
import { Role } from "@prisma/client";
import { notificationController } from "../controllers/notification.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  broadcastSchema,
  listNotificationsQuerySchema,
  notificationParamsSchema,
} from "../validators/notification.validator";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

/**
 * @openapi
 * /notifications/me:
 *   get:
 *     summary: List the logged-in user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of notifications
 */
notificationRouter.get(
  "/me",
  validate({ query: listNotificationsQuerySchema }),
  notificationController.listMine
);

notificationRouter.patch("/read-all", notificationController.markAllRead);

notificationRouter.patch(
  "/:notificationId/read",
  validate({ params: notificationParamsSchema }),
  notificationController.markRead
);

/**
 * @openapi
 * /notifications/broadcast:
 *   post:
 *     summary: Broadcast a notification to students, recruiters, or everyone (Placement Officer only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Broadcast sent
 */
notificationRouter.post(
  "/broadcast",
  requireRole(Role.PLACEMENT_OFFICER),
  validate({ body: broadcastSchema }),
  notificationController.broadcast
);

/**
 * @openapi
 * /notifications/deadline-reminders:
 *   post:
 *     summary: Send application-deadline reminders for drives closing soon (Placement Officer only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reminders sent
 */
notificationRouter.post(
  "/deadline-reminders",
  requireRole(Role.PLACEMENT_OFFICER),
  notificationController.sendDeadlineReminders
);
