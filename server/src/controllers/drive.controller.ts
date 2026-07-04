import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { driveService } from "../services/drive.service";

export const driveController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const drive = await driveService.create(req.user!.id, req.user!.role, req.body);
    res.status(201).json(new ApiResponse(drive, "Drive created"));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const drive = await driveService.getById(req.params.driveId);
    res.json(new ApiResponse(drive));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const drive = await driveService.update(
      req.user!.id,
      req.user!.role,
      req.params.driveId,
      req.body
    );
    res.json(new ApiResponse(drive, "Drive updated"));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await driveService.remove(req.user!.id, req.user!.role, req.params.driveId);
    res.json(new ApiResponse(null, "Drive deleted"));
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await driveService.list(req.query as never);
    res.json(new ApiResponse(items, "Success", meta));
  }),
};
