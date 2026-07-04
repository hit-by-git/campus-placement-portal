import { z } from "zod";

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().uuid(),
  round: z.coerce.number().int().min(1).default(1),
  scheduledAt: z.coerce.date(),
  mode: z.enum(["ONLINE", "IN_PERSON"]).default("ONLINE"),
  location: z.string().optional(),
});

export const updateInterviewSchema = z.object({
  round: z.coerce.number().int().min(1).optional(),
  scheduledAt: z.coerce.date().optional(),
  mode: z.enum(["ONLINE", "IN_PERSON"]).optional(),
  location: z.string().optional(),
  feedback: z.string().optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
});

export const interviewParamsSchema = z.object({
  interviewId: z.string().uuid(),
});
