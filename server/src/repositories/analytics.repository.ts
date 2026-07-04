import { prisma } from "../config/prisma";

export const analyticsRepository = {
  countStudents: () => prisma.studentProfile.count(),

  countPlacedStudents: () =>
    prisma.application.count({
      where: { offer: { status: "ACCEPTED" } },
    }),

  acceptedOfferPackageStats: () =>
    prisma.offer.aggregate({
      where: { status: "ACCEPTED" },
      _avg: { packageLPA: true },
      _max: { packageLPA: true },
    }),

  applicationsPerCompany: () =>
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
        drives: { select: { _count: { select: { applications: true } } } },
      },
    }),

  async skillDistribution() {
    const grouped = await prisma.studentSkill.groupBy({
      by: ["skillId"],
      _count: { skillId: true },
      orderBy: { _count: { skillId: "desc" } },
    });

    const skills = await prisma.skill.findMany({
      where: { id: { in: grouped.map((g) => g.skillId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(skills.map((s) => [s.id, s.name]));

    return grouped.map((g) => ({
      skillName: nameById.get(g.skillId) ?? "Unknown",
      studentCount: g._count.skillId,
    }));
  },

  listStudentsForExport: () =>
    prisma.studentProfile.findMany({
      select: {
        fullName: true,
        cgpa: true,
        branch: true,
        degree: true,
        graduationYear: true,
        activeBacklogs: true,
        resumeUrl: true,
        user: { select: { email: true } },
      },
      orderBy: { fullName: "asc" },
    }),

  listPlacementsForExport: () =>
    prisma.offer.findMany({
      where: { status: "ACCEPTED" },
      select: {
        packageLPA: true,
        status: true,
        issuedAt: true,
        application: {
          select: {
            student: { select: { fullName: true, user: { select: { email: true } } } },
            drive: { select: { title: true, company: { select: { name: true } } } },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    }),
};
