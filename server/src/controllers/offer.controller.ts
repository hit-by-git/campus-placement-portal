import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { offerService } from "../services/offer.service";

export const offerController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const offer = await offerService.create(req.user!.id, req.user!.role, req.body);
    res.status(201).json(new ApiResponse(offer, "Offer created"));
  }),

  uploadOfferLetter: asyncHandler(async (req: Request, res: Response) => {
    const offer = await offerService.uploadOfferLetter(
      req.user!.id,
      req.user!.role,
      req.params.offerId,
      req.file
    );
    res.json(new ApiResponse(offer, "Offer letter uploaded"));
  }),

  respond: asyncHandler(async (req: Request, res: Response) => {
    const offer = await offerService.respond(req.user!.id, req.params.offerId, req.body);
    res.json(new ApiResponse(offer, "Offer response recorded"));
  }),
};
