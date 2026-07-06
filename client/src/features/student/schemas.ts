import { z } from "zod";

export const profileFormSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z.union([z.string().min(7), z.literal("")]).optional(),
  cgpa: z.number().min(0).max(10),
  branch: z.string().min(2),
  degree: z.string().min(2),
  graduationYear: z.number().int().min(2000).max(2100),
  activeBacklogs: z.number().int().min(0),
  gender: z.enum(["MALE", "FEMALE", "OTHER", ""]).optional(),
  github: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
  linkedin: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
  bio: z.string().max(1000).optional(),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const certificateFormSchema = z.object({
  title: z.string().min(2, "Enter a title"),
  issuer: z.string().optional(),
  url: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
  issuedDate: z.string().optional(),
});
export type CertificateFormValues = z.infer<typeof certificateFormSchema>;
