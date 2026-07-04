import { Role } from "@prisma/client";
import { z } from "zod";
import { applicationRepository } from "../repositories/application.repository";
import { offerRepository } from "../repositories/offer.repository";
import { storageService } from "./storage";
import { ApiError } from "../utils/ApiError";
import { assertRecruiterOwnsCompany } from "./companyAccess.util";
import { createOfferSchema, respondToOfferSchema } from "../validators/offer.validator";

type CreateOfferInput = z.infer<typeof createOfferSchema>;
type RespondToOfferInput = z.infer<typeof respondToOfferSchema>;

const OFFERABLE_STATUSES = ["SHORTLISTED", "INTERVIEW"];

export const offerService = {
  async create(userId: string, role: Role, input: CreateOfferInput) {
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) throw ApiError.notFound("Application not found");
    await assertRecruiterOwnsCompany(userId, role, application.drive.companyId);

    if (!OFFERABLE_STATUSES.includes(application.status)) {
      throw ApiError.badRequest(`Cannot make an offer for an application in status ${application.status}`);
    }

    const existingOffer = await offerRepository.findByApplicationId(input.applicationId);
    if (existingOffer) throw ApiError.conflict("An offer already exists for this application");

    const offer = await offerRepository.create({
      packageLPA: input.packageLPA,
      application: { connect: { id: input.applicationId } },
    });

    await applicationRepository.updateStatus(input.applicationId, "OFFERED");

    return offer;
  },

  async uploadOfferLetter(userId: string, role: Role, offerId: string, file: Express.Multer.File | undefined) {
    if (!file) throw ApiError.badRequest("A PDF offer letter file is required");

    const offer = await offerRepository.findById(offerId);
    if (!offer) throw ApiError.notFound("Offer not found");
    await assertRecruiterOwnsCompany(userId, role, offer.application.drive.companyId);

    const stored = await storageService.save(
      { buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype },
      `offer-letters/${offer.id}`
    );

    return offerRepository.update(offerId, { offerLetterUrl: stored.url });
  },

  async respond(userId: string, offerId: string, input: RespondToOfferInput) {
    const offer = await offerRepository.findById(offerId);
    if (!offer) throw ApiError.notFound("Offer not found");
    if (offer.application.student.userId !== userId) throw ApiError.forbidden();

    if (offer.status !== "PENDING") {
      throw ApiError.badRequest(`Offer has already been ${offer.status.toLowerCase()}`);
    }

    return offerRepository.update(offerId, { status: input.status });
  },
};
