import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const createApplicationSchema = z.object({
  driveId: z.string().uuid(),
});

export const applicationParamsSchema = z.object({
  applicationId: z.string().uuid(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["SHORTLISTED", "INTERVIEW", "REJECTED"]),
});

export const listApplicationsQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED", "WITHDRAWN"])
    .optional(),
});
