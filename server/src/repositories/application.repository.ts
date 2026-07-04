import { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const applicationInclude = {
  drive: { include: { company: { select: { id: true, name: true, logoUrl: true } } } },
  student: {
    select: {
      id: true,
      userId: true,
      fullName: true,
      cgpa: true,
      branch: true,
      degree: true,
      graduationYear: true,
      resumeUrl: true,
      user: { select: { email: true } },
    },
  },
  interviews: { orderBy: { round: "asc" as const } },
  offer: true,
};

export const applicationRepository = {
  create: (data: Prisma.ApplicationCreateInput) =>
    prisma.application.create({ data, include: applicationInclude }),

  findById: (id: string) =>
    prisma.application.findUnique({ where: { id }, include: applicationInclude }),

  findByStudentAndDrive: (studentId: string, driveId: string) =>
    prisma.application.findUnique({ where: { studentId_driveId: { studentId, driveId } } }),

  findAppliedStudentIds: async (driveId: string) =>
    (await prisma.application.findMany({ where: { driveId }, select: { studentId: true } })).map(
      (a) => a.studentId
    ),

  updateStatus: (id: string, status: ApplicationStatus) =>
    prisma.application.update({ where: { id }, data: { status }, include: applicationInclude }),

  async list(params: {
    skip: number;
    take: number;
    studentId?: string;
    driveId?: string;
    status?: ApplicationStatus;
  }) {
    const where: Prisma.ApplicationWhereInput = {
      ...(params.studentId ? { studentId: params.studentId } : {}),
      ...(params.driveId ? { driveId: params.driveId } : {}),
      ...(params.status ? { status: params.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: applicationInclude,
        skip: params.skip,
        take: params.take,
        orderBy: { appliedAt: "desc" },
      }),
      prisma.application.count({ where }),
    ]);

    return { items, total };
  },
};
