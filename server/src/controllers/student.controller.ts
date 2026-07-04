import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { studentService } from "../services/student.service";

export const studentController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const profile = await studentService.getOwnProfile(req.user!.id);
    res.json(new ApiResponse(profile));
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const profile = await studentService.updateOwnProfile(req.user!.id, req.body);
    res.json(new ApiResponse(profile, "Profile updated"));
  }),

  addSkill: asyncHandler(async (req: Request, res: Response) => {
    const skill = await studentService.addSkill(req.user!.id, req.body);
    res.status(201).json(new ApiResponse(skill, "Skill added"));
  }),

  removeSkill: asyncHandler(async (req: Request, res: Response) => {
    await studentService.removeSkill(req.user!.id, req.params.skillId);
    res.json(new ApiResponse(null, "Skill removed"));
  }),

  addCertificate: asyncHandler(async (req: Request, res: Response) => {
    const certificate = await studentService.addCertificate(req.user!.id, req.body);
    res.status(201).json(new ApiResponse(certificate, "Certificate added"));
  }),

  updateCertificate: asyncHandler(async (req: Request, res: Response) => {
    const certificate = await studentService.updateCertificate(
      req.user!.id,
      req.params.certificateId,
      req.body
    );
    res.json(new ApiResponse(certificate, "Certificate updated"));
  }),

  deleteCertificate: asyncHandler(async (req: Request, res: Response) => {
    await studentService.deleteCertificate(req.user!.id, req.params.certificateId);
    res.json(new ApiResponse(null, "Certificate deleted"));
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await studentService.list(req.query as never);
    res.json(new ApiResponse(items, "Success", meta));
  }),
};
