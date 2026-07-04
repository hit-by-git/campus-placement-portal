import { NotificationType } from "@prisma/client";
import { adminRepository } from "../repositories/admin.repository";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, parsePagination, PaginationQuery } from "../utils/pagination";
import { notificationService } from "./notification.service";

export const adminService = {
  async listPendingRecruiters(query: PaginationQuery) {
    const { page, limit, skip, take } = parsePagination(query);
    const { items, total } = await adminRepository.listPendingRecruiters({ skip, take });
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },

  async approveRecruiter(userId: string) {
    const recruiter = await adminRepository.findRecruiterByUserId(userId);
    if (!recruiter) throw ApiError.notFound("Recruiter not found");
    if (recruiter.isApproved) throw ApiError.conflict("Recruiter is already approved");

    const updated = await adminRepository.approveRecruiterByUserId(userId);

    await notificationService.notify(
      userId,
      NotificationType.RECRUITER_APPROVED,
      "Your recruiter account has been approved",
      `You can now log in and start creating drives for ${updated.company?.name ?? "your company"}.`
    );

    return updated;
  },
};
