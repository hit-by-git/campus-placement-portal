import { prisma } from "../config/prisma";

export const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true, recruiterProfile: true },
    }),

  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true, recruiterProfile: true },
    }),

  findByEmailVerifyTokenHash: (tokenHash: string) =>
    prisma.user.findFirst({ where: { emailVerifyToken: tokenHash } }),

  findByPasswordResetTokenHash: (tokenHash: string) =>
    prisma.user.findFirst({ where: { passwordResetToken: tokenHash } }),

  createStudent: (params: {
    email: string;
    passwordHash: string;
    emailVerifyToken: string;
    emailVerifyExpiresAt: Date;
    fullName: string;
    cgpa: number;
    branch: string;
    degree: string;
    graduationYear: number;
  }) =>
    prisma.user.create({
      data: {
        email: params.email,
        passwordHash: params.passwordHash,
        role: "STUDENT",
        emailVerifyToken: params.emailVerifyToken,
        emailVerifyExpiresAt: params.emailVerifyExpiresAt,
        studentProfile: {
          create: {
            fullName: params.fullName,
            cgpa: params.cgpa,
            branch: params.branch,
            degree: params.degree,
            graduationYear: params.graduationYear,
          },
        },
      },
      include: { studentProfile: true },
    }),

  createRecruiter: (params: {
    email: string;
    passwordHash: string;
    emailVerifyToken: string;
    emailVerifyExpiresAt: Date;
    designation: string;
    companyName: string;
    companyWebsite?: string;
    companyDescription?: string;
  }) =>
    prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: params.email,
          passwordHash: params.passwordHash,
          role: "RECRUITER",
          emailVerifyToken: params.emailVerifyToken,
          emailVerifyExpiresAt: params.emailVerifyExpiresAt,
        },
      });

      const company = await tx.company.create({
        data: {
          name: params.companyName,
          website: params.companyWebsite,
          description: params.companyDescription,
          createdByUserId: user.id,
        },
      });

      const recruiterProfile = await tx.recruiterProfile.create({
        data: {
          userId: user.id,
          designation: params.designation,
          companyId: company.id,
          isApproved: false,
        },
      });

      return { user, company, recruiterProfile };
    }),

  setEmailVerified: (id: string) =>
    prisma.user.update({
      where: { id },
      data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpiresAt: null },
    }),

  setPasswordResetToken: (id: string, tokenHash: string, expiresAt: Date) =>
    prisma.user.update({
      where: { id },
      data: { passwordResetToken: tokenHash, passwordResetExpiresAt: expiresAt },
    }),

  resetPassword: (id: string, passwordHash: string) =>
    prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        refreshTokenHash: null,
      },
    }),

  setRefreshTokenHash: (id: string, refreshTokenHash: string | null) =>
    prisma.user.update({ where: { id }, data: { refreshTokenHash } }),
};
