import { prisma } from "../config/prisma";

export const resumeRepository = {
  create: (data: {
    studentId: string;
    fileUrl: string;
    parsedName: string | null;
    parsedEducation: string | null;
    parsedProjects: string | null;
  }) => prisma.resume.create({ data }),

  findLatestByStudentId: (studentId: string) =>
    prisma.resume.findFirst({ where: { studentId }, orderBy: { uploadedAt: "desc" } }),
};
