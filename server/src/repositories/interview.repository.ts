import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const interviewInclude = {
  application: { include: { drive: { select: { id: true, companyId: true, title: true } } } },
};

export const interviewRepository = {
  create: (data: Prisma.InterviewCreateInput) =>
    prisma.interview.create({ data, include: interviewInclude }),

  findById: (id: string) =>
    prisma.interview.findUnique({ where: { id }, include: interviewInclude }),

  update: (id: string, data: Prisma.InterviewUpdateInput) =>
    prisma.interview.update({ where: { id }, data }),
};
