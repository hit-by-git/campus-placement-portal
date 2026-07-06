import { axiosClient } from "./axiosClient";
import type { Application, ApiResponse, ApplicationStatus, PaginationMeta } from "../types";

export interface ListApplicationsParams {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
}

export const applicationsApi = {
  apply: (driveId: string) =>
    axiosClient.post<ApiResponse<Application>>("/applications", { driveId }).then((r) => r.data),

  listMine: (params: ListApplicationsParams = {}) =>
    axiosClient
      .get<ApiResponse<Application[]>>("/applications/me", { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta as PaginationMeta })),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<Application>>(`/applications/${id}`).then((r) => r.data.data),

  withdraw: (id: string) =>
    axiosClient.patch<ApiResponse<Application>>(`/applications/${id}/withdraw`).then((r) => r.data),

  listForDrive: (driveId: string, params: ListApplicationsParams = {}) =>
    axiosClient
      .get<ApiResponse<Application[]>>(`/drives/${driveId}/applicants`, { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta as PaginationMeta })),

  updateStatus: (id: string, status: "SHORTLISTED" | "INTERVIEW" | "REJECTED") =>
    axiosClient
      .patch<ApiResponse<Application>>(`/applications/${id}/status`, { status })
      .then((r) => r.data),
};
