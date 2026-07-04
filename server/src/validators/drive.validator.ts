import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const createDriveSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(2),
  jobDescription: z.string().min(10),
  packageLPA: z.coerce.number().positive(),
  location: z.string().min(2),
  deadline: z.coerce.date(),
  minCgpa: z.coerce.number().min(0).max(10).default(0),
  allowedBranches: z.array(z.string()).default([]),
  allowedDegrees: z.array(z.string()).default([]),
  maxGraduationYear: z.coerce.number().int().optional(),
  maxBacklogs: z.coerce.number().int().min(0).default(0),
  genderRule: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

export const updateDriveSchema = createDriveSchema
  .omit({ companyId: true })
  .partial()
  .extend({
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  });

export const listDrivesQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  companyId: z.string().uuid().optional(),
  location: z.string().optional(),
});

export const driveParamsSchema = z.object({
  driveId: z.string().uuid(),
});
