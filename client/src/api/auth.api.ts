import { axiosClient } from "./axiosClient";
import type { ApiResponse, Role, User } from "../types";

interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterStudentPayload {
  email: string;
  password: string;
  fullName: string;
  cgpa: number;
  branch: string;
  degree: string;
  graduationYear: number;
}

export interface RegisterRecruiterPayload {
  email: string;
  password: string;
  designation: string;
  companyName: string;
  companyWebsite?: string;
  companyDescription?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    axiosClient
      .post<ApiResponse<LoginResponse>>("/auth/login", { email, password })
      .then((res) => res.data.data),

  refresh: () =>
    axiosClient.post<ApiResponse<LoginResponse>>("/auth/refresh").then((res) => res.data.data),

  logout: () => axiosClient.post("/auth/logout"),

  registerStudent: (payload: RegisterStudentPayload) =>
    axiosClient
      .post<ApiResponse<{ id: string; email: string; role: Role }>>(
        "/auth/register/student",
        payload
      )
      .then((res) => res.data),

  registerRecruiter: (payload: RegisterRecruiterPayload) =>
    axiosClient
      .post<ApiResponse<{ id: string; email: string; role: Role }>>(
        "/auth/register/recruiter",
        payload
      )
      .then((res) => res.data),

  verifyEmail: (token: string) =>
    axiosClient.post<ApiResponse<null>>("/auth/verify-email", { token }).then((res) => res.data),

  forgotPassword: (email: string) =>
    axiosClient.post<ApiResponse<null>>("/auth/forgot-password", { email }).then((res) => res.data),

  resetPassword: (token: string, password: string) =>
    axiosClient
      .post<ApiResponse<null>>("/auth/reset-password", { token, password })
      .then((res) => res.data),
};
