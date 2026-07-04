import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { notificationService } from "../services/notification.service";

export const notificationController = {
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const { items, unreadCount, meta } = await notificationService.listMine(
      req.user!.id,
      req.query as never
    );
    res.json(new ApiResponse({ items, unreadCount }, "Success", meta));
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(
      req.user!.id,
      req.params.notificationId
    );
    res.json(new ApiResponse(notification, "Notification marked as read"));
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.user!.id);
    res.json(new ApiResponse(null, "All notifications marked as read"));
  }),

  broadcast: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.broadcast(
      req.body.title,
      req.body.message,
      req.body.audience
    );
    res.status(201).json(new ApiResponse(result, "Broadcast sent"));
  }),

  sendDeadlineReminders: asyncHandler(async (_req: Request, res: Response) => {
    const result = await notificationService.sendDeadlineReminders();
    res.json(new ApiResponse(result, "Deadline reminders sent"));
  }),
};
