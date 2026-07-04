import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerStudentSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  fullName: z.string().min(2),
  cgpa: z.coerce.number().min(0).max(10),
  branch: z.string().min(2),
  degree: z.string().min(2),
  graduationYear: z.coerce.number().int().min(2000).max(2100),
});

export const registerRecruiterSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  designation: z.string().min(2),
  companyName: z.string().min(2),
  companyWebsite: z.string().url().optional(),
  companyDescription: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
