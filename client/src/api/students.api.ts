import { axiosClient } from "./axiosClient";
import type { ApiResponse, Resume, StudentProfile } from "../types";

export interface UpdateStudentProfilePayload {
  fullName?: string;
  phone?: string;
  cgpa?: number;
  branch?: string;
  degree?: string;
  graduationYear?: number;
  activeBacklogs?: number;
  gender?: "MALE" | "FEMALE" | "OTHER";
  github?: string;
  linkedin?: string;
  bio?: string;
}

export interface CertificatePayload {
  title: string;
  issuer?: string;
  url?: string;
  issuedDate?: string;
}

export const studentsApi = {
  getMe: () => axiosClient.get<ApiResponse<StudentProfile>>("/students/me").then((r) => r.data.data),

  updateMe: (payload: UpdateStudentProfilePayload) =>
    axiosClient
      .patch<ApiResponse<StudentProfile>>("/students/me", payload)
      .then((r) => r.data.data),

  addSkill: (name: string, proficiency: number) =>
    axiosClient.post("/students/me/skills", { name, proficiency }).then((r) => r.data),

  removeSkill: (skillId: string) =>
    axiosClient.delete(`/students/me/skills/${skillId}`).then((r) => r.data),

  addCertificate: (payload: CertificatePayload) =>
    axiosClient.post("/students/me/certificates", payload).then((r) => r.data),

  updateCertificate: (id: string, payload: Partial<CertificatePayload>) =>
    axiosClient.patch(`/students/me/certificates/${id}`, payload).then((r) => r.data),

  deleteCertificate: (id: string) =>
    axiosClient.delete(`/students/me/certificates/${id}`).then((r) => r.data),

  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    return axiosClient
      .post<ApiResponse<{ resume: Resume; matchedSkillNames: string[] }>>(
        "/students/me/resume",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then((r) => r.data.data);
  },

  getLatestResume: () =>
    axiosClient.get<ApiResponse<Resume>>("/students/me/resume").then((r) => r.data.data),
};
