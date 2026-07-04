import { Role } from "@prisma/client";
import { z } from "zod";
import { driveRepository } from "../repositories/drive.repository";
import { companyRepository } from "../repositories/company.repository";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
import { createDriveSchema, listDrivesQuerySchema, updateDriveSchema } from "../validators/drive.validator";

type CreateDriveInput = z.infer<typeof createDriveSchema>;
type UpdateDriveInput = z.infer<typeof updateDriveSchema>;
type ListDrivesQuery = z.infer<typeof listDrivesQuerySchema>;

const assertCanManageCompany = async (userId: string, role: Role, companyId: string) => {
  if (role === Role.PLACEMENT_OFFICER) return;

  const recruiterProfile = await companyRepository.findRecruiterProfileByUserId(userId);
  if (!recruiterProfile || recruiterProfile.companyId !== companyId) {
    throw ApiError.forbidden("You do not manage this company's drives");
  }
};

export const driveService = {
  async create(userId: string, role: Role, input: CreateDriveInput) {
    await assertCanManageCompany(userId, role, input.companyId);

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
    await assertCanManageCompany(userId, role, drive.companyId);
    return driveRepository.update(id, input);
  },

  async remove(userId: string, role: Role, id: string) {
    const drive = await this.getById(id);
    await assertCanManageCompany(userId, role, drive.companyId);
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
};
