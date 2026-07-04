import { Role } from "@prisma/client";
import { z } from "zod";
import { applicationRepository } from "../repositories/application.repository";
import { driveRepository } from "../repositories/drive.repository";
import { studentRepository } from "../repositories/student.repository";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
import { assertRecruiterOwnsCompany } from "./companyAccess.util";
import { evaluateEligibility } from "./eligibility.service";
import { listApplicationsQuerySchema, updateApplicationStatusSchema } from "../validators/application.validator";

type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
type UpdateStatusInput = z.infer<typeof updateApplicationStatusSchema>;

const WITHDRAWABLE_STATUSES = ["APPLIED", "SHORTLISTED", "INTERVIEW"];

const getOwnStudentProfileOrThrow = async (userId: string) => {
  const profile = await studentRepository.findByUserId(userId);
  if (!profile) throw ApiError.notFound("Student profile not found");
  return profile;
};

export const applicationService = {
  async apply(userId: string, driveId: string) {
    const profile = await getOwnStudentProfileOrThrow(userId);

    const drive = await driveRepository.findById(driveId);
    if (!drive) throw ApiError.notFound("Drive not found");
    if (drive.status !== "PUBLISHED" || drive.deadline < new Date()) {
      throw ApiError.badRequest("Applications are closed for this drive");
    }

    const eligibility = evaluateEligibility(profile, drive);
    if (!eligibility.eligible) {
      throw ApiError.forbidden("You are not eligible for this drive", eligibility.reasons);
    }

    const existing = await applicationRepository.findByStudentAndDrive(profile.id, driveId);
    if (existing) {
      if (existing.status !== "WITHDRAWN") {
        throw ApiError.conflict("You have already applied to this drive");
      }
      return applicationRepository.updateStatus(existing.id, "APPLIED");
    }

    return applicationRepository.create({
      student: { connect: { id: profile.id } },
      drive: { connect: { id: driveId } },
    });
  },

  async withdraw(userId: string, applicationId: string) {
    const profile = await getOwnStudentProfileOrThrow(userId);
    const application = await applicationRepository.findById(applicationId);
    if (!application) throw ApiError.notFound("Application not found");
    if (application.student.id !== profile.id) throw ApiError.forbidden();
    if (!WITHDRAWABLE_STATUSES.includes(application.status)) {
      throw ApiError.badRequest(`Cannot withdraw an application in status ${application.status}`);
    }
    return applicationRepository.updateStatus(applicationId, "WITHDRAWN");
  },

  async listMine(userId: string, query: ListApplicationsQuery) {
    const profile = await getOwnStudentProfileOrThrow(userId);
    const { page, limit, skip, take } = parsePagination(query);
    const { items, total } = await applicationRepository.list({
      skip,
      take,
      studentId: profile.id,
      status: query.status,
    });
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },

  async listForDrive(userId: string, role: Role, driveId: string, query: ListApplicationsQuery) {
    const drive = await driveRepository.findById(driveId);
    if (!drive) throw ApiError.notFound("Drive not found");
    await assertRecruiterOwnsCompany(userId, role, drive.companyId);

    const { page, limit, skip, take } = parsePagination(query);
    const { items, total } = await applicationRepository.list({
      skip,
      take,
      driveId,
      status: query.status,
    });
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },

  async getById(userId: string, role: Role, applicationId: string) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) throw ApiError.notFound("Application not found");

    if (role === Role.STUDENT) {
      const profile = await getOwnStudentProfileOrThrow(userId);
      if (application.student.id !== profile.id) throw ApiError.forbidden();
    } else {
      await assertRecruiterOwnsCompany(userId, role, application.drive.companyId);
    }

    return application;
  },

  async updateStatus(userId: string, role: Role, applicationId: string, input: UpdateStatusInput) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) throw ApiError.notFound("Application not found");
    await assertRecruiterOwnsCompany(userId, role, application.drive.companyId);

    if (["OFFERED", "WITHDRAWN"].includes(application.status)) {
      throw ApiError.badRequest(`Cannot change status of an application that is ${application.status}`);
    }

    return applicationRepository.updateStatus(applicationId, input.status);
  },
};
