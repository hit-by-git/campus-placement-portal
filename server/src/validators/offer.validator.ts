import { z } from "zod";

export const createOfferSchema = z.object({
  applicationId: z.string().uuid(),
  packageLPA: z.coerce.number().positive(),
});

export const respondToOfferSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

export const offerParamsSchema = z.object({
  offerId: z.string().uuid(),
});
