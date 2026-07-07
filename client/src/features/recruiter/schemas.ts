import { z } from "zod";

export const companyFormSchema = z.object({
  name: z.string().min(2, "Enter a company name"),
  description: z.string().optional(),
  website: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
});
export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const driveFormSchema = z.object({
  title: z.string().min(2, "Enter a title"),
  jobDescription: z.string().min(10, "Add a longer job description"),
  packageLPA: z.number().positive("Enter a positive package"),
  location: z.string().min(2, "Enter a location"),
  deadline: z.string().min(1, "Pick a deadline"),
  minCgpa: z.number().min(0).max(10),
  allowedBranches: z.string().optional(),
  allowedDegrees: z.string().optional(),
  maxBacklogs: z.number().int().min(0),
});
export type DriveFormValues = z.infer<typeof driveFormSchema>;

export const scheduleInterviewFormSchema = z.object({
  round: z.number().int().min(1),
  scheduledAt: z.string().min(1, "Pick a date/time"),
  mode: z.enum(["ONLINE", "IN_PERSON"]),
  location: z.string().optional(),
});
export type ScheduleInterviewFormValues = z.infer<typeof scheduleInterviewFormSchema>;

export const makeOfferFormSchema = z.object({
  packageLPA: z.number().positive("Enter a positive package"),
});
export type MakeOfferFormValues = z.infer<typeof makeOfferFormSchema>;
