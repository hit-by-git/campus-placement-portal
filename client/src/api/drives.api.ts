import { axiosClient } from "./axiosClient";
import type { ApiResponse, Drive, DriveRecommendation, DriveStatus, PaginationMeta } from "../types";

export interface ListDrivesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  location?: string;
  companyId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export interface CreateDrivePayload {
  companyId: string;
  title: string;
  jobDescription: string;
  packageLPA: number;
  location: string;
  deadline: string;
  minCgpa?: number;
  allowedBranches?: string[];
  allowedDegrees?: string[];
  maxGraduationYear?: number;
  maxBacklogs?: number;
  genderRule?: "MALE" | "FEMALE" | "OTHER";
}

export type UpdateDrivePayload = Partial<Omit<CreateDrivePayload, "companyId">> & {
  status?: DriveStatus;
};

export const drivesApi = {
  list: (params: ListDrivesParams = {}) =>
    axiosClient
      .get<ApiResponse<Drive[]>>("/drives", { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta as PaginationMeta })),

  listEligible: (params: { page?: number; limit?: number } = {}) =>
    axiosClient
      .get<ApiResponse<Drive[]>>("/drives/eligible", { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta as PaginationMeta })),

  getById: (id: string) => axiosClient.get<ApiResponse<Drive>>(`/drives/${id}`).then((r) => r.data.data),

  checkEligibility: (id: string) =>
    axiosClient.get<ApiResponse<EligibilityResult>>(`/drives/${id}/eligibility`).then((r) => r.data.data),

  recommended: (limit = 10) =>
    axiosClient
      .get<ApiResponse<DriveRecommendation[]>>("/recommendations/drives", { params: { limit } })
      .then((r) => r.data.data),

  create: (payload: CreateDrivePayload) =>
    axiosClient.post<ApiResponse<Drive>>("/drives", payload).then((r) => r.data),

  update: (id: string, payload: UpdateDrivePayload) =>
    axiosClient.patch<ApiResponse<Drive>>(`/drives/${id}`, payload).then((r) => r.data),

  remove: (id: string) => axiosClient.delete(`/drives/${id}`).then((r) => r.data),
};
