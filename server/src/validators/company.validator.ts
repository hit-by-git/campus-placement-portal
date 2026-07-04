import { z } from "zod";
import { paginationQuerySchema, sortQuerySchema } from "./common.validator";

export const COMPANY_SORT_FIELDS = ["createdAt", "name"] as const;

export const createCompanySchema = z.object({
  name: z.string().min(2),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const listCompaniesQuerySchema = paginationQuerySchema.merge(sortQuerySchema).extend({
  search: z.string().optional(),
});

export const companyParamsSchema = z.object({
  companyId: z.string().uuid(),
});
