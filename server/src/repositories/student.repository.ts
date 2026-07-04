import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const profileInclude = {
  skills: { include: { skill: true } },
  certificates: true,
  resumes: { orderBy: { uploadedAt: "desc" as const }, take: 1 },
  user: { select: { email: true, isEmailVerified: true } },
};

export const studentRepository = {
  findByUserId: (userId: string) =>
    prisma.studentProfile.findUnique({ where: { userId }, include: profileInclude }),

  findById: (id: string) => prisma.studentProfile.findUnique({ where: { id }, include: profileInclude }),

  updateProfile: (id: string, data: Prisma.StudentProfileUpdateInput) =>
    prisma.studentProfile.update({ where: { id }, data, include: profileInclude }),

  upsertSkillByName: (name: string) =>
    prisma.skill.upsert({ where: { name }, create: { name }, update: {} }),

  addSkillToStudent: (studentId: string, skillId: string, proficiency: number) =>
    prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId, skillId } },
      create: { studentId, skillId, proficiency },
      update: { proficiency },
      include: { skill: true },
    }),

  removeSkillFromStudent: (studentId: string, skillId: string) =>
    prisma.studentSkill.deleteMany({ where: { studentId, skillId } }),

  /** Links a skill without overwriting an existing proficiency the student already set. */
  ensureSkillLinked: (studentId: string, skillId: string) =>
    prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId, skillId } },
      create: { studentId, skillId, proficiency: 1 },
      update: {},
    }),

  listAllSkillNames: async () => (await prisma.skill.findMany({ select: { name: true } })).map((s) => s.name),

  addCertificate: (studentId: string, data: Omit<Prisma.CertificateCreateInput, "student">) =>
    prisma.certificate.create({ data: { ...data, student: { connect: { id: studentId } } } }),

  findCertificate: (id: string) => prisma.certificate.findUnique({ where: { id } }),

  updateCertificate: (id: string, data: Prisma.CertificateUpdateInput) =>
    prisma.certificate.update({ where: { id }, data }),

  deleteCertificate: (id: string) => prisma.certificate.delete({ where: { id } }),

  async list(params: {
    skip: number;
    take: number;
    search?: string;
    branch?: string;
    minCgpa?: number;
    graduationYear?: number;
  }) {
    const where: Prisma.StudentProfileWhereInput = {
      ...(params.branch ? { branch: { equals: params.branch, mode: "insensitive" } } : {}),
      ...(params.minCgpa !== undefined ? { cgpa: { gte: params.minCgpa } } : {}),
      ...(params.graduationYear !== undefined ? { graduationYear: params.graduationYear } : {}),
      ...(params.search
        ? {
            OR: [
              { fullName: { contains: params.search, mode: "insensitive" } },
              { user: { email: { contains: params.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.studentProfile.findMany({
        where,
        include: profileInclude,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.studentProfile.count({ where }),
    ]);

    return { items, total };
  },
};
