import { Role } from "@prisma/client";
import { z } from "zod";
import { driveRepository } from "../repositories/drive.repository";
import { studentRepository } from "../repositories/student.repository";
import { ApiError } from "../utils/ApiError";
import { PaginationMeta } from "../utils/ApiResponse";
import { buildListCacheKey } from "../utils/cacheKey";
import { buildPaginationMeta, parsePagination, PaginationQuery } from "../utils/pagination";
import { parseSort } from "../utils/sorting";
import { assertRecruiterOwnsCompany } from "./companyAccess.util";
import { cacheService } from "./cache.service";
import { evaluateEligibility } from "./eligibility.service";
import { notificationService } from "./notification.service";
import {
  createDriveSchema,
  DRIVE_SORT_FIELDS,
  listDrivesQuerySchema,
  updateDriveSchema,
} from "../validators/drive.validator";

type CreateDriveInput = z.infer<typeof createDriveSchema>;
type UpdateDriveInput = z.infer<typeof updateDriveSchema>;
type ListDrivesQuery = z.infer<typeof listDrivesQuerySchema>;

const DRIVE_LIST_CACHE_PREFIX = "drives:list";
const DRIVE_LIST_CACHE_TTL_SECONDS = 60;

export const driveService = {
  async create(userId: string, role: Role, input: CreateDriveInput) {
    await assertRecruiterOwnsCompany(userId, role, input.companyId);

    const { companyId, ...rest } = input;
    const drive = await driveRepository.create({
      ...rest,
      company: { connect: { id: companyId } },
    });
    await cacheService.invalidatePrefix(DRIVE_LIST_CACHE_PREFIX);
    return drive;
  },

  async getById(id: string) {
    const drive = await driveRepository.findById(id);
    if (!drive) throw ApiError.notFound("Drive not found");
    return drive;
  },

  async update(userId: string, role: Role, id: string, input: UpdateDriveInput) {
    const drive = await this.getById(id);
    await assertRecruiterOwnsCompany(userId, role, drive.companyId);
    const updated = await driveRepository.update(id, input);
    await cacheService.invalidatePrefix(DRIVE_LIST_CACHE_PREFIX);

    if (input.status === "PUBLISHED" && drive.status !== "PUBLISHED") {
      await notificationService.notifyEligibleStudentsOfNewDrive(id);
    }

    return updated;
  },

  async remove(userId: string, role: Role, id: string) {
    const drive = await this.getById(id);
    await assertRecruiterOwnsCompany(userId, role, drive.companyId);
    await driveRepository.delete(id);
    await cacheService.invalidatePrefix(DRIVE_LIST_CACHE_PREFIX);
  },

  async list(query: ListDrivesQuery) {
    const cacheKey = buildListCacheKey(DRIVE_LIST_CACHE_PREFIX, query);
    const cached = await cacheService.get<{ items: unknown[]; meta: PaginationMeta }>(cacheKey);
    if (cached) return cached;

    const { page, limit, skip, take } = parsePagination(query);
    const orderBy = parseSort(query.sortBy, query.sortOrder, DRIVE_SORT_FIELDS, "createdAt");
    const { items, total } = await driveRepository.list({
      skip,
      take,
      search: query.search,
      status: query.status,
      companyId: query.companyId,
      location: query.location,
      orderBy,
    });
    const result = { items, meta: buildPaginationMeta(total, page, limit) };

    await cacheService.set(cacheKey, result, DRIVE_LIST_CACHE_TTL_SECONDS);
    return result;
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
