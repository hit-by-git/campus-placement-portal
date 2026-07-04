import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { analyticsService } from "../services/analytics.service";

const sendCsv = (res: Response, filename: string, csv: string) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
};

export const analyticsController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.overview();
    res.json(new ApiResponse(data));
  }),

  applicationsPerCompany: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.applicationsPerCompany();
    res.json(new ApiResponse(data));
  }),

  skillDistribution: asyncHandler(async (_req: Request, res: Response) => {
    const data = await analyticsService.skillDistribution();
    res.json(new ApiResponse(data));
  }),

  exportStudentsCsv: asyncHandler(async (_req: Request, res: Response) => {
    const csv = await analyticsService.exportStudentsCsv();
    sendCsv(res, "students.csv", csv);
  }),

  exportPlacementsCsv: asyncHandler(async (_req: Request, res: Response) => {
    const csv = await analyticsService.exportPlacementsCsv();
    sendCsv(res, "placements.csv", csv);
  }),
};
