import { Role } from "@prisma/client";
import { z } from "zod";
import { driveRepository } from "../repositories/drive.repository";
import { studentRepository } from "../repositories/student.repository";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, parsePagination, PaginationQuery } from "../utils/pagination";
import { assertRecruiterOwnsCompany } from "./companyAccess.util";
import { evaluateEligibility } from "./eligibility.service";
import { createDriveSchema, listDrivesQuerySchema, updateDriveSchema } from "../validators/drive.validator";

type CreateDriveInput = z.infer<typeof createDriveSchema>;
type UpdateDriveInput = z.infer<typeof updateDriveSchema>;
type ListDrivesQuery = z.infer<typeof listDrivesQuerySchema>;

export const driveService = {
  async create(userId: string, role: Role, input: CreateDriveInput) {
    await assertRecruiterOwnsCompany(userId, role, input.companyId);

    const { companyId, ...rest } = input;
    return driveRepository.create({
      ...rest,
      company: { connect: { id: companyId } },
    });
  },

  async getById(id: string) {
    const drive = await driveRepository.findById(id);
    if (!drive) throw ApiError.notFound("Drive not found");
    return drive;
  },

  async update(userId: string, role: Role, id: string, input: UpdateDriveInput) {
    const drive = await this.getById(id);
    await assertRecruiterOwnsCompany(userId, role, drive.companyId);
    return driveRepository.update(id, input);
  },

  async remove(userId: string, role: Role, id: string) {
    const drive = await this.getById(id);
    await assertRecruiterOwnsCompany(userId, role, drive.companyId);
    await driveRepository.delete(id);
  },

  async list(query: ListDrivesQuery) {
    const { page, limit, skip, take } = parsePagination(query);
    const { items, total } = await driveRepository.list({
      skip,
      take,
      search: query.search,
      status: query.status,
      companyId: query.companyId,
      location: query.location,
    });
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },

  async checkEligibility(userId: string, driveId: string) {
    const profile = await studentRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound("Student profile not found");

    const drive = await this.getById(driveId);
    return evaluateEligibility(profile, drive);
  },

  async listEligibleForStudent(userId: string, query: PaginationQuery) {
    const profile = await studentRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound("Student profile not found");

    const openDrives = await driveRepository.findOpenDrives();
    const eligibleDrives = openDrives.filter((drive) => evaluateEligibility(profile, drive).eligible);

    const { page, limit, skip, take } = parsePagination(query);
    const items = eligibleDrives.slice(skip, skip + take);

    return { items, meta: buildPaginationMeta(eligibleDrives.length, page, limit) };
  },
};
