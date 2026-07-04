import { z } from "zod";
import { paginationQuerySchema, sortQuerySchema } from "./common.validator";

export const APPLICATION_SORT_FIELDS = ["appliedAt", "updatedAt", "status"] as const;

export const createApplicationSchema = z.object({
  driveId: z.string().uuid(),
});

export const applicationParamsSchema = z.object({
  applicationId: z.string().uuid(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["SHORTLISTED", "INTERVIEW", "REJECTED"]),
});

export const listApplicationsQuerySchema = paginationQuerySchema.merge(sortQuerySchema).extend({
  status: z
    .enum(["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED", "WITHDRAWN"])
    .optional(),
});
