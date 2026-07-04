import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { interviewService } from "../services/interview.service";

export const interviewController = {
  schedule: asyncHandler(async (req: Request, res: Response) => {
    const interview = await interviewService.schedule(req.user!.id, req.user!.role, req.body);
    res.status(201).json(new ApiResponse(interview, "Interview scheduled"));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const interview = await interviewService.update(
      req.user!.id,
      req.user!.role,
      req.params.interviewId,
      req.body
    );
    res.json(new ApiResponse(interview, "Interview updated"));
  }),
};
