import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { generateRawToken, hashToken } from "../utils/token";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sendMail } from "../config/mailer";
import { env } from "../config/env";
import { z } from "zod";
import {
  registerRecruiterSchema,
  registerStudentSchema,
} from "../validators/auth.validator";

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
type RegisterRecruiterInput = z.infer<typeof registerRecruiterSchema>;

const buildVerificationEmail = (email: string, rawToken: string) => {
  const link = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
  return sendMail({
    to: email,
    subject: "Verify your Campus Placement Portal account",
    html: `<p>Welcome! Please verify your email by clicking the link below:</p><p><a href="${link}">${link}</a></p>`,
  });
};

const issueTokenPair = async (userId: string, role: Parameters<typeof signAccessToken>[0]["role"]) => {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId });
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await userRepository.setRefreshTokenHash(userId, refreshTokenHash);
  return { accessToken, refreshToken };
};

export const authService = {
  async registerStudent(input: RegisterStudentInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict("An account with this email already exists");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const rawToken = generateRawToken();

    const user = await userRepository.createStudent({
      email: input.email,
      passwordHash,
      emailVerifyToken: hashToken(rawToken),
      emailVerifyExpiresAt: new Date(Date.now() + EMAIL_VERIFY_TTL_MS),
      fullName: input.fullName,
      cgpa: input.cgpa,
      branch: input.branch,
      degree: input.degree,
      graduationYear: input.graduationYear,
    });

    await buildVerificationEmail(user.email, rawToken);

    return { id: user.id, email: user.email, role: user.role };
  },

  async registerRecruiter(input: RegisterRecruiterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict("An account with this email already exists");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const rawToken = generateRawToken();

    const { user } = await userRepository.createRecruiter({
      email: input.email,
      passwordHash,
      emailVerifyToken: hashToken(rawToken),
      emailVerifyExpiresAt: new Date(Date.now() + EMAIL_VERIFY_TTL_MS),
      designation: input.designation,
      companyName: input.companyName,
      companyWebsite: input.companyWebsite,
      companyDescription: input.companyDescription,
    });

    await buildVerificationEmail(user.email, rawToken);

    return { id: user.id, email: user.email, role: user.role };
  },

  async verifyEmail(rawToken: string) {
    const user = await userRepository.findByEmailVerifyTokenHash(hashToken(rawToken));
    if (!user || !user.emailVerifyExpiresAt || user.emailVerifyExpiresAt < new Date()) {
      throw ApiError.badRequest("Verification link is invalid or has expired");
    }
    await userRepository.setEmailVerified(user.id);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw ApiError.unauthorized("Invalid email or password");

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) throw ApiError.unauthorized("Invalid email or password");

    if (!user.isEmailVerified) {
      throw ApiError.forbidden("Please verify your email before logging in");
    }

    if (user.role === "RECRUITER" && !user.recruiterProfile?.isApproved) {
      throw ApiError.forbidden("Your recruiter account is pending Placement Officer approval");
    }

    const { accessToken, refreshToken } = await issueTokenPair(user.id, user.role);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user?.refreshTokenHash) throw ApiError.unauthorized("Session no longer valid");

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      await userRepository.setRefreshTokenHash(user.id, null);
      throw ApiError.unauthorized("Refresh token reuse detected, please log in again");
    }

    const tokens = await issueTokenPair(user.id, user.role);
    return { ...tokens, user: { id: user.id, email: user.email, role: user.role } };
  },

  async logout(userId: string) {
    await userRepository.setRefreshTokenHash(userId, null);
  },

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) return; // avoid leaking account existence

    const rawToken = generateRawToken();
    await userRepository.setPasswordResetToken(
      user.id,
      hashToken(rawToken),
      new Date(Date.now() + PASSWORD_RESET_TTL_MS)
    );

    const link = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendMail({
      to: user.email,
      subject: "Reset your Campus Placement Portal password",
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${link}">${link}</a></p>`,
    });
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const user = await userRepository.findByPasswordResetTokenHash(hashToken(rawToken));
    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw ApiError.badRequest("Reset link is invalid or has expired");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.resetPassword(user.id, passwordHash);
  },
};
