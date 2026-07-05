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

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all of the logged-in user's notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
notificationRouter.patch("/read-all", notificationController.markAllRead);

/**
 * @openapi
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a single notification as read (owner only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
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
