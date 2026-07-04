import { Role } from "@prisma/client";
import { z } from "zod";
import { companyRepository } from "../repositories/company.repository";
import { ApiError } from "../utils/ApiError";
import { PaginationMeta } from "../utils/ApiResponse";
import { buildListCacheKey } from "../utils/cacheKey";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
import { parseSort } from "../utils/sorting";
import { assertRecruiterOwnsCompany } from "./companyAccess.util";
import { cacheService } from "./cache.service";
import {
  COMPANY_SORT_FIELDS,
  createCompanySchema,
  listCompaniesQuerySchema,
  updateCompanySchema,
} from "../validators/company.validator";

type CreateCompanyInput = z.infer<typeof createCompanySchema>;
type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;

const COMPANY_LIST_CACHE_PREFIX = "companies:list";
const COMPANY_LIST_CACHE_TTL_SECONDS = 60;

export const companyService = {
  async create(userId: string, input: CreateCompanyInput) {
    const company = await companyRepository.create({
      ...input,
      createdBy: { connect: { id: userId } },
    });
    await cacheService.invalidatePrefix(COMPANY_LIST_CACHE_PREFIX);
    return company;
  },

  async getById(id: string) {
    const company = await companyRepository.findById(id);
    if (!company) throw ApiError.notFound("Company not found");
    return company;
  },

  async update(userId: string, role: Role, id: string, input: UpdateCompanyInput) {
    await this.getById(id);
    await assertRecruiterOwnsCompany(userId, role, id);
    const updated = await companyRepository.update(id, input);
    await cacheService.invalidatePrefix(COMPANY_LIST_CACHE_PREFIX);
    return updated;
  },

  async remove(id: string) {
    await this.getById(id);
    await companyRepository.delete(id);
    await cacheService.invalidatePrefix(COMPANY_LIST_CACHE_PREFIX);
  },

  async list(query: ListCompaniesQuery) {
    const cacheKey = buildListCacheKey(COMPANY_LIST_CACHE_PREFIX, query);
    const cached = await cacheService.get<{ items: unknown[]; meta: PaginationMeta }>(cacheKey);
    if (cached) return cached;

    const { page, limit, skip, take } = parsePagination(query);
    const orderBy = parseSort(query.sortBy, query.sortOrder, COMPANY_SORT_FIELDS, "createdAt");
    const { items, total } = await companyRepository.list({ skip, take, search: query.search, orderBy });
    const result = { items, meta: buildPaginationMeta(total, page, limit) };

    await cacheService.set(cacheKey, result, COMPANY_LIST_CACHE_TTL_SECONDS);
    return result;
  },
};
