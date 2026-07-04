import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { adminService } from "../services/admin.service";

export const adminController = {
  listPendingRecruiters: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await adminService.listPendingRecruiters(req.query as never);
    res.json(new ApiResponse(items, "Success", meta));
  }),

  approveRecruiter: asyncHandler(async (req: Request, res: Response) => {
    const recruiter = await adminService.approveRecruiter(req.params.userId);
    res.json(new ApiResponse(recruiter, "Recruiter approved"));
  }),
};
