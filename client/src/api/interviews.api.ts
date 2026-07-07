import { axiosClient } from "./axiosClient";
import type { ApiResponse, Interview } from "../types";

export interface ScheduleInterviewPayload {
  applicationId: string;
  round?: number;
  scheduledAt: string;
  mode?: "ONLINE" | "IN_PERSON";
  location?: string;
}

export const interviewsApi = {
  schedule: (payload: ScheduleInterviewPayload) =>
    axiosClient.post<ApiResponse<Interview>>("/interviews", payload).then((r) => r.data),

  update: (id: string, payload: Partial<ScheduleInterviewPayload> & { status?: string; feedback?: string }) =>
    axiosClient.patch<ApiResponse<Interview>>(`/interviews/${id}`, payload).then((r) => r.data),
};
