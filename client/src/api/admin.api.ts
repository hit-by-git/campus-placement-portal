import { axiosClient } from "./axiosClient";
import type { ApiResponse, PaginationMeta } from "../types";

export interface PendingRecruiter {
  user: { id: string; email: string; createdAt: string };
  company: { id: string; name: string } | null;
  designation: string | null;
}

export const adminApi = {
  listPendingRecruiters: (params: { page?: number; limit?: number } = {}) =>
    axiosClient
      .get<ApiResponse<PendingRecruiter[]>>("/admin/recruiters/pending", { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta as PaginationMeta })),

  approveRecruiter: (userId: string) =>
    axiosClient.patch(`/admin/recruiters/${userId}/approve`).then((r) => r.data),
};
