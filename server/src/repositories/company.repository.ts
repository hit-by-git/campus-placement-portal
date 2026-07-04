import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { SortOrder } from "../utils/sorting";

export const companyRepository = {
  create: (data: Prisma.CompanyCreateInput) => prisma.company.create({ data }),

  findById: (id: string) => prisma.company.findUnique({ where: { id } }),

  update: (id: string, data: Prisma.CompanyUpdateInput) =>
    prisma.company.update({ where: { id }, data }),

  delete: (id: string) => prisma.company.delete({ where: { id } }),

  findRecruiterProfileByUserId: (userId: string) =>
    prisma.recruiterProfile.findUnique({ where: { userId } }),

  async list(params: {
    skip: number;
    take: number;
    search?: string;
    orderBy: Record<string, SortOrder>;
  }) {
    const where: Prisma.CompanyWhereInput = params.search
      ? { name: { contains: params.search, mode: "insensitive" } }
      : {};

    const [items, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
      }),
      prisma.company.count({ where }),
    ]);

    return { items, total };
  },
};
