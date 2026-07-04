import { NotificationType } from "@prisma/client";
import { notificationRepository } from "../repositories/notification.repository";
import { studentRepository } from "../repositories/student.repository";
import { driveRepository } from "../repositories/drive.repository";
import { applicationRepository } from "../repositories/application.repository";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, parsePagination, PaginationQuery } from "../utils/pagination";
import { evaluateEligibility } from "./eligibility.service";

interface ListNotificationsQuery extends PaginationQuery {
  unread?: boolean;
}

const DEADLINE_REMINDER_WINDOW_MS = 48 * 60 * 60 * 1000;

export const notificationService = {
  notify: (userId: string, type: NotificationType, title: string, message: string) =>
    notificationRepository.create({ userId, type, title, message }),

  async notifyEligibleStudentsOfNewDrive(driveId: string) {
    const drive = await driveRepository.findById(driveId);
    if (!drive) return;

    const students = await studentRepository.listAllForEligibilityCheck();
    const eligibleStudents = students.filter((s) => evaluateEligibility(s, drive).eligible);

    if (eligibleStudents.length === 0) return;

    await notificationRepository.createMany(
      eligibleStudents.map((s) => ({
        userId: s.userId,
        type: NotificationType.DRIVE_CREATED,
        title: `New drive: ${drive.title}`,
        message: `${drive.company.name} published "${drive.title}" (${drive.packageLPA} LPA, ${drive.location}). You're eligible to apply.`,
      }))
    );
  },

  async sendDeadlineReminders() {
    const soon = new Date(Date.now() + DEADLINE_REMINDER_WINDOW_MS);
    const openDrives = await driveRepository.findOpenDrives();
    const closingSoonDrives = openDrives.filter((d) => d.deadline <= soon);

    const students = await studentRepository.listAllForEligibilityCheck();
    let notified = 0;

    for (const drive of closingSoonDrives) {
      const appliedStudentIds = new Set(await applicationRepository.findAppliedStudentIds(drive.id));
      const eligibleStudents = students.filter(
        (s) => !appliedStudentIds.has(s.id) && evaluateEligibility(s, drive).eligible
      );

      if (eligibleStudents.length === 0) continue;

      await notificationRepository.createMany(
        eligibleStudents.map((s) => ({
          userId: s.userId,
          type: NotificationType.APPLICATION_DEADLINE,
          title: `Deadline approaching: ${drive.title}`,
          message: `Applications for "${drive.title}" at ${drive.company.name} close on ${drive.deadline.toDateString()}.`,
        }))
      );
      notified += eligibleStudents.length;
    }

    return { drivesChecked: closingSoonDrives.length, notificationsSent: notified };
  },

  async broadcast(title: string, message: string, audience: "ALL" | "STUDENTS" | "RECRUITERS") {
    const userIds: string[] = [];
    if (audience === "ALL" || audience === "STUDENTS") {
      userIds.push(...(await notificationRepository.findAllUserIdsByRole("STUDENT")));
    }
    if (audience === "ALL" || audience === "RECRUITERS") {
      userIds.push(...(await notificationRepository.findAllUserIdsByRole("RECRUITER")));
    }

    if (userIds.length === 0) return { notified: 0 };

    await notificationRepository.createMany(
      userIds.map((userId) => ({ userId, type: NotificationType.BROADCAST, title, message }))
    );
    return { notified: userIds.length };
  },

  async listMine(userId: string, query: ListNotificationsQuery) {
    const { page, limit, skip, take } = parsePagination(query);
    const { items, total, unreadCount } = await notificationRepository.list({
      userId,
      skip,
      take,
      unreadOnly: query.unread,
    });
    return { items, unreadCount, meta: buildPaginationMeta(total, page, limit) };
  },

  async markRead(userId: string, notificationId: string) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) throw ApiError.notFound("Notification not found");
    if (notification.userId !== userId) throw ApiError.forbidden();
    return notificationRepository.markRead(notificationId);
  },

  markAllRead: (userId: string) => notificationRepository.markAllReadForUser(userId),
};
