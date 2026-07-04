import { z } from "zod";
import { studentRepository } from "../repositories/student.repository";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
import {
  addSkillSchema,
  certificateSchema,
  listStudentsQuerySchema,
  updateStudentProfileSchema,
} from "../validators/student.validator";

type UpdateProfileInput = z.infer<typeof updateStudentProfileSchema>;
type AddSkillInput = z.infer<typeof addSkillSchema>;
type CertificateInput = z.infer<typeof certificateSchema>;
type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;

const getOwnProfileOrThrow = async (userId: string) => {
  const profile = await studentRepository.findByUserId(userId);
  if (!profile) throw ApiError.notFound("Student profile not found");
  return profile;
};

export const studentService = {
  getOwnProfile: (userId: string) => getOwnProfileOrThrow(userId),

  async updateOwnProfile(userId: string, input: UpdateProfileInput) {
    const profile = await getOwnProfileOrThrow(userId);
    return studentRepository.updateProfile(profile.id, input);
  },

  async addSkill(userId: string, input: AddSkillInput) {
    const profile = await getOwnProfileOrThrow(userId);
    const skill = await studentRepository.upsertSkillByName(input.name.trim());
    return studentRepository.addSkillToStudent(profile.id, skill.id, input.proficiency);
  },

  async removeSkill(userId: string, skillId: string) {
    const profile = await getOwnProfileOrThrow(userId);
    const result = await studentRepository.removeSkillFromStudent(profile.id, skillId);
    if (result.count === 0) throw ApiError.notFound("Skill not found on this profile");
  },

  async addCertificate(userId: string, input: CertificateInput) {
    const profile = await getOwnProfileOrThrow(userId);
    return studentRepository.addCertificate(profile.id, input);
  },

  async updateCertificate(userId: string, certificateId: string, input: Partial<CertificateInput>) {
    const profile = await getOwnProfileOrThrow(userId);
    const certificate = await studentRepository.findCertificate(certificateId);
    if (!certificate || certificate.studentId !== profile.id) {
      throw ApiError.notFound("Certificate not found");
    }
    return studentRepository.updateCertificate(certificateId, input);
  },

  async deleteCertificate(userId: string, certificateId: string) {
    const profile = await getOwnProfileOrThrow(userId);
    const certificate = await studentRepository.findCertificate(certificateId);
    if (!certificate || certificate.studentId !== profile.id) {
      throw ApiError.notFound("Certificate not found");
    }
    await studentRepository.deleteCertificate(certificateId);
  },

  async list(query: ListStudentsQuery) {
    const { page, limit, skip, take } = parsePagination(query);
    const { items, total } = await studentRepository.list({
      skip,
      take,
      search: query.search,
      branch: query.branch,
      minCgpa: query.minCgpa,
      graduationYear: query.graduationYear,
    });
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },
};
