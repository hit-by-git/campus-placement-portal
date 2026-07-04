import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const recruiterInclude = {
  user: { select: { id: true, email: true, createdAt: true } },
  company: { select: { id: true, name: true } },
};

export const adminRepository = {
  async listPendingRecruiters(params: { skip: number; take: number }) {
    const where: Prisma.RecruiterProfileWhereInput = { isApproved: false };

    const [items, total] = await Promise.all([
      prisma.recruiterProfile.findMany({
        where,
        include: recruiterInclude,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "asc" },
      }),
      prisma.recruiterProfile.count({ where }),
    ]);

    return { items, total };
  },

  findRecruiterByUserId: (userId: string) =>
    prisma.recruiterProfile.findUnique({ where: { userId }, include: recruiterInclude }),

  approveRecruiterByUserId: (userId: string) =>
    prisma.recruiterProfile.update({
      where: { userId },
      data: { isApproved: true },
      include: recruiterInclude,
    }),
};
