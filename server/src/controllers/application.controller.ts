import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { applicationService } from "../services/application.service";

export const applicationController = {
  apply: asyncHandler(async (req: Request, res: Response) => {
    const application = await applicationService.apply(req.user!.id, req.body.driveId);
    res.status(201).json(new ApiResponse(application, "Application submitted"));
  }),

  withdraw: asyncHandler(async (req: Request, res: Response) => {
    const application = await applicationService.withdraw(req.user!.id, req.params.applicationId);
    res.json(new ApiResponse(application, "Application withdrawn"));
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await applicationService.listMine(req.user!.id, req.query as never);
    res.json(new ApiResponse(items, "Success", meta));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const application = await applicationService.getById(
      req.user!.id,
      req.user!.role,
      req.params.applicationId
    );
    res.json(new ApiResponse(application));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const application = await applicationService.updateStatus(
      req.user!.id,
      req.user!.role,
      req.params.applicationId,
      req.body
    );
    res.json(new ApiResponse(application, "Application status updated"));
  }),

  listForDrive: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await applicationService.listForDrive(
      req.user!.id,
      req.user!.role,
      req.params.driveId,
      req.query as never
    );
    res.json(new ApiResponse(items, "Success", meta));
  }),
};
