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

/**
 * @openapi
 * /offers/{offerId}/offer-letter:
 *   post:
 *     summary: Upload the offer letter PDF for an offer (Recruiter/Placement Officer)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               offerLetter: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Offer letter uploaded
 */
offerRouter.post(
  "/:offerId/offer-letter",
  requireRole(Role.RECRUITER, Role.PLACEMENT_OFFICER),
  validate({ params: offerParamsSchema }),
  uploadPdf("offerLetter"),
  offerController.uploadOfferLetter
);

/**
 * @openapi
 * /offers/{offerId}/respond:
 *   patch:
 *     summary: Accept or decline an offer (owning Student only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Offer response recorded
 */
offerRouter.patch(
  "/:offerId/respond",
  requireRole(Role.STUDENT),
  validate({ params: offerParamsSchema, body: respondToOfferSchema }),
  offerController.respond
);
