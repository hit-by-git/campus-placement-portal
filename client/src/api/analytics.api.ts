import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types";

export interface AnalyticsOverview {
  totalStudents: number;
  placedStudents: number;
  placementPercentage: number;
  averagePackageLPA: number;
  highestPackageLPA: number;
}

export interface ApplicationsPerCompany {
  companyId: string;
  companyName: string;
  applicationCount: number;
}

export interface SkillDistributionEntry {
  skillName: string;
  studentCount: number;
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const analyticsApi = {
  overview: () =>
    axiosClient.get<ApiResponse<AnalyticsOverview>>("/analytics/overview").then((r) => r.data.data),

  applicationsPerCompany: () =>
    axiosClient
      .get<ApiResponse<ApplicationsPerCompany[]>>("/analytics/applications-per-company")
      .then((r) => r.data.data),

  skillDistribution: () =>
    axiosClient
      .get<ApiResponse<SkillDistributionEntry[]>>("/analytics/skill-distribution")
      .then((r) => r.data.data),

  exportStudentsCsv: async () => {
    const res = await axiosClient.get("/analytics/export/students", { responseType: "blob" });
    downloadBlob(res.data, "students.csv");
  },

  exportPlacementsCsv: async () => {
    const res = await axiosClient.get("/analytics/export/placements", { responseType: "blob" });
    downloadBlob(res.data, "placements.csv");
  },
};
