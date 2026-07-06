import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number");

export const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerStudentFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
  fullName: z.string().min(2, "Enter your full name"),
  cgpa: z.number({ error: "Enter your CGPA" }).min(0).max(10),
  branch: z.string().min(2, "Enter your branch"),
  degree: z.string().min(2, "Enter your degree"),
  graduationYear: z.number({ error: "Enter your graduation year" }).int().min(2000).max(2100),
});
export type RegisterStudentFormValues = z.infer<typeof registerStudentFormSchema>;

export const registerRecruiterFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
  designation: z.string().min(2, "Enter your designation"),
  companyName: z.string().min(2, "Enter your company name"),
  companyWebsite: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
  companyDescription: z.string().optional(),
});
export type RegisterRecruiterFormValues = z.infer<typeof registerRecruiterFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z.object({
  password: passwordSchema,
});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
