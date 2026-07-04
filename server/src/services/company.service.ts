import { Role } from "@prisma/client";
import { z } from "zod";
import { companyRepository } from "../repositories/company.repository";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
import { parseSort } from "../utils/sorting";
import { assertRecruiterOwnsCompany } from "./companyAccess.util";
import {
  COMPANY_SORT_FIELDS,
  createCompanySchema,
  listCompaniesQuerySchema,
  updateCompanySchema,
} from "../validators/company.validator";

type CreateCompanyInput = z.infer<typeof createCompanySchema>;
type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
type ListCompaniesQuery = z.infer<typeof listCompaniesQuerySchema>;

export const companyService = {
  async create(userId: string, input: CreateCompanyInput) {
    return companyRepository.create({ ...input, createdBy: { connect: { id: userId } } });
  },

  async getById(id: string) {
    const company = await companyRepository.findById(id);
    if (!company) throw ApiError.notFound("Company not found");
    return company;
  },

  async update(userId: string, role: Role, id: string, input: UpdateCompanyInput) {
    await this.getById(id);
    await assertRecruiterOwnsCompany(userId, role, id);
    return companyRepository.update(id, input);
  },

  async remove(id: string) {
    await this.getById(id);
    await companyRepository.delete(id);
  },

  async list(query: ListCompaniesQuery) {
    const { page, limit, skip, take } = parsePagination(query);
    const orderBy = parseSort(query.sortBy, query.sortOrder, COMPANY_SORT_FIELDS, "createdAt");
    const { items, total } = await companyRepository.list({ skip, take, search: query.search, orderBy });
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },
};
