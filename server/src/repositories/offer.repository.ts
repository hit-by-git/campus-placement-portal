import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const offerInclude = {
  application: {
    include: {
      drive: {
        select: { id: true, companyId: true, title: true, company: { select: { name: true } } },
      },
      student: { select: { id: true, userId: true, fullName: true } },
    },
  },
};

export const offerRepository = {
  create: (data: Prisma.OfferCreateInput) => prisma.offer.create({ data, include: offerInclude }),

  findById: (id: string) => prisma.offer.findUnique({ where: { id }, include: offerInclude }),

  findByApplicationId: (applicationId: string) =>
    prisma.offer.findUnique({ where: { applicationId } }),

  update: (id: string, data: Prisma.OfferUpdateInput) =>
    prisma.offer.update({ where: { id }, data, include: offerInclude }),
};
