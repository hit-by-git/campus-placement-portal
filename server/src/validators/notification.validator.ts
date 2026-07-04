import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  unread: z.coerce.boolean().optional(),
});

export const notificationParamsSchema = z.object({
  notificationId: z.string().uuid(),
});

export const broadcastSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(2),
  audience: z.enum(["ALL", "STUDENTS", "RECRUITERS"]).default("ALL"),
});
