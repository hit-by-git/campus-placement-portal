import { axiosClient } from "./axiosClient";
import type { ApiResponse, Company } from "../types";

export interface CompanyPayload {
  name?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
}

export const companiesApi = {
  getMyCompany: () => axiosClient.get<ApiResponse<Company>>("/companies/me").then((r) => r.data.data),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<Company>>(`/companies/${id}`).then((r) => r.data.data),

  update: (id: string, payload: CompanyPayload) =>
    axiosClient.patch<ApiResponse<Company>>(`/companies/${id}`, payload).then((r) => r.data),
};
