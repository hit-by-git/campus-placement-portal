import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { resumeService } from "../services/resume.service";

export const resumeController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    const result = await resumeService.uploadAndParse(req.user!.id, req.file);
    res.status(201).json(new ApiResponse(result, "Resume uploaded and parsed"));
  }),

  getLatest: asyncHandler(async (req: Request, res: Response) => {
    const resume = await resumeService.getLatest(req.user!.id);
    res.json(new ApiResponse(resume));
  }),
};
