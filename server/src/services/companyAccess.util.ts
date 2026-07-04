import { Role } from "@prisma/client";
import { companyRepository } from "../repositories/company.repository";
import { ApiError } from "../utils/ApiError";

/** Placement Officers may manage anything; Recruiters only their own company. */
export const assertRecruiterOwnsCompany = async (userId: string, role: Role, companyId: string) => {
  if (role === Role.PLACEMENT_OFFICER) return;

  const recruiterProfile = await companyRepository.findRecruiterProfileByUserId(userId);
  if (!recruiterProfile || recruiterProfile.companyId !== companyId) {
    throw ApiError.forbidden("You do not manage this company's resources");
  }
};
