import { Router } from "express";
import { Role } from "@prisma/client";
import { offerController } from "../controllers/offer.controller";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { uploadPdf } from "../middlewares/upload";
import { createOfferSchema, offerParamsSchema, respondToOfferSchema } from "../validators/offer.validator";

export const offerRouter = Router();

offerRouter.use(requireAuth);

/**
 * @openapi
 * /offers:
 *   post:
 *     summary: Create an offer for an application (Recruiter/Placement Officer)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Offer created
 */
offerRouter.post(
  "/",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ body: createOfferSchema }),
  offerController.create
);

offerRouter.post(
  "/:offerId/offer-letter",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ params: offerParamsSchema }),
  uploadPdf("offerLetter"),
  offerController.uploadOfferLetter
);

offerRouter.patch(
  "/:offerId/respond",
  requireRole(Role.STUDENT),
  validate({ params: offerParamsSchema, body: respondToOfferSchema }),
  offerController.respond
);
