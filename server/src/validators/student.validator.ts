import { z } from "zod";
import { paginationQuerySchema, sortQuerySchema } from "./common.validator";

export const STUDENT_SORT_FIELDS = ["createdAt", "fullName", "cgpa", "graduationYear"] as const;

export const updateStudentProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(7).max(20).optional(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  branch: z.string().min(2).optional(),
  degree: z.string().min(2).optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2100).optional(),
  activeBacklogs: z.coerce.number().int().min(0).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
});

export const addSkillSchema = z.object({
  name: z.string().min(1).max(50),
  proficiency: z.coerce.number().int().min(1).max(5).default(1),
});

export const skillParamsSchema = z.object({
  skillId: z.string().uuid(),
});

export const certificateSchema = z.object({
  title: z.string().min(2),
  issuer: z.string().optional(),
  url: z.string().url().optional(),
  issuedDate: z.coerce.date().optional(),
});

export const certificateParamsSchema = z.object({
  certificateId: z.string().uuid(),
});

export const listStudentsQuerySchema = paginationQuerySchema.merge(sortQuerySchema).extend({
  search: z.string().optional(),
  branch: z.string().optional(),
  minCgpa: z.coerce.number().min(0).max(10).optional(),
  graduationYear: z.coerce.number().int().optional(),
});
