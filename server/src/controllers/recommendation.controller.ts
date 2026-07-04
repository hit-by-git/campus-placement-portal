import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { recommendationService } from "../services/recommendation.service";

export const recommendationController = {
  recommendDrives: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const recommendations = await recommendationService.recommendDrivesForStudent(
      req.user!.id,
      limit
    );
    res.json(new ApiResponse(recommendations));
  }),
};
