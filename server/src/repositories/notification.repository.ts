import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const notificationRepository = {
  create: (data: { userId: string; type: NotificationType; title: string; message: string }) =>
    prisma.notification.create({ data }),

  createMany: (
    notifications: { userId: string; type: NotificationType; title: string; message: string }[]
  ) => prisma.notification.createMany({ data: notifications }),

  findById: (id: string) => prisma.notification.findUnique({ where: { id } }),

  markRead: (id: string) => prisma.notification.update({ where: { id }, data: { isRead: true } }),

  markAllReadForUser: (userId: string) =>
    prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } }),

  async list(params: { userId: string; skip: number; take: number; unreadOnly?: boolean }) {
    const where: Prisma.NotificationWhereInput = {
      userId: params.userId,
      ...(params.unreadOnly ? { isRead: false } : {}),
    };

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: params.userId, isRead: false } }),
    ]);

    return { items, total, unreadCount };
  },

  findAllUserIdsByRole: async (role: "STUDENT" | "RECRUITER") =>
    (await prisma.user.findMany({ where: { role }, select: { id: true } })).map((u) => u.id),
};
