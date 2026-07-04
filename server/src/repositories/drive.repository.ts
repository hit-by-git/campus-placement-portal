import { DriveStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const driveInclude = {
  company: { select: { id: true, name: true, logoUrl: true } },
};

export const driveRepository = {
  create: (data: Prisma.DriveCreateInput) =>
    prisma.drive.create({ data, include: driveInclude }),

  findById: (id: string) => prisma.drive.findUnique({ where: { id }, include: driveInclude }),

  update: (id: string, data: Prisma.DriveUpdateInput) =>
    prisma.drive.update({ where: { id }, data, include: driveInclude }),

  delete: (id: string) => prisma.drive.delete({ where: { id } }),

  findOpenDrives: () =>
    prisma.drive.findMany({
      where: { status: DriveStatus.PUBLISHED, deadline: { gte: new Date() } },
      include: driveInclude,
      orderBy: { deadline: "asc" },
    }),

  async list(params: {
    skip: number;
    take: number;
    search?: string;
    status?: DriveStatus;
    companyId?: string;
    location?: string;
  }) {
    const where: Prisma.DriveWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.companyId ? { companyId: params.companyId } : {}),
      ...(params.location ? { location: { contains: params.location, mode: "insensitive" } } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: "insensitive" } },
              { jobDescription: { contains: params.search, mode: "insensitive" } },
              { company: { name: { contains: params.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.drive.findMany({
        where,
        include: driveInclude,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.drive.count({ where }),
    ]);

    return { items, total };
  },
};
