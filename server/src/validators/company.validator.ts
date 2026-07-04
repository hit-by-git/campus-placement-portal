import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const createCompanySchema = z.object({
  name: z.string().min(2),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const listCompaniesQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

export const companyParamsSchema = z.object({
  companyId: z.string().uuid(),
});
