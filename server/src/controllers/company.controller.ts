import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { companyService } from "../services/company.service";

export const companyController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.create(req.user!.id, req.body);
    res.status(201).json(new ApiResponse(company, "Company created"));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.getById(req.params.companyId);
    res.json(new ApiResponse(company));
  }),

  getMyCompany: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.getMyCompany(req.user!.id);
    res.json(new ApiResponse(company));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.update(
      req.user!.id,
      req.user!.role,
      req.params.companyId,
      req.body
    );
    res.json(new ApiResponse(company, "Company updated"));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await companyService.remove(req.params.companyId);
    res.json(new ApiResponse(null, "Company deleted"));
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await companyService.list(req.query as never);
    res.json(new ApiResponse(items, "Success", meta));
  }),
};
