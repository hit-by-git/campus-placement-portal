import { axiosClient } from "./axiosClient";
import type { ApiResponse, Notification, PaginationMeta } from "../types";

export const notificationsApi = {
  listMine: (params: { page?: number; limit?: number; unread?: boolean } = {}) =>
    axiosClient
      .get<ApiResponse<{ items: Notification[]; unreadCount: number }>>("/notifications/me", {
        params,
      })
      .then((r) => ({
        items: r.data.data.items,
        unreadCount: r.data.data.unreadCount,
        meta: r.data.meta as PaginationMeta,
      })),

  markRead: (id: string) => axiosClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => axiosClient.patch("/notifications/read-all").then((r) => r.data),

  broadcast: (title: string, message: string, audience: "ALL" | "STUDENTS" | "RECRUITERS") =>
    axiosClient
      .post<ApiResponse<{ notified: number }>>("/notifications/broadcast", {
        title,
        message,
        audience,
      })
      .then((r) => r.data),

  sendDeadlineReminders: () =>
    axiosClient
      .post<ApiResponse<{ drivesChecked: number; notificationsSent: number }>>(
        "/notifications/deadline-reminders"
      )
      .then((r) => r.data),
};
