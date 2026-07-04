import { Drive, StudentProfile } from "@prisma/client";

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

/**
 * Pure rules engine: given a student's profile and a drive's eligibility
 * criteria, decides whether the student may apply. Empty allowedBranches /
 * allowedDegrees arrays mean "no restriction" for that criterion.
 */
export const evaluateEligibility = (
  student: Pick<StudentProfile, "cgpa" | "branch" | "degree" | "graduationYear" | "activeBacklogs" | "gender">,
  drive: Pick<
    Drive,
    "minCgpa" | "allowedBranches" | "allowedDegrees" | "maxGraduationYear" | "maxBacklogs" | "genderRule"
  >
): EligibilityResult => {
  const reasons: string[] = [];

  if (student.cgpa < drive.minCgpa) {
    reasons.push(`CGPA ${student.cgpa} is below the required minimum of ${drive.minCgpa}`);
  }

  if (drive.allowedBranches.length > 0 && !drive.allowedBranches.includes(student.branch)) {
    reasons.push(`Branch "${student.branch}" is not eligible for this drive`);
  }

  if (drive.allowedDegrees.length > 0 && !drive.allowedDegrees.includes(student.degree)) {
    reasons.push(`Degree "${student.degree}" is not eligible for this drive`);
  }

  if (drive.maxGraduationYear !== null && student.graduationYear > drive.maxGraduationYear) {
    reasons.push(`Graduation year ${student.graduationYear} is after the drive's cutoff of ${drive.maxGraduationYear}`);
  }

  if (student.activeBacklogs > drive.maxBacklogs) {
    reasons.push(`Active backlogs (${student.activeBacklogs}) exceed the allowed maximum of ${drive.maxBacklogs}`);
  }

  if (drive.genderRule && student.gender !== drive.genderRule) {
    reasons.push("Gender criterion for this drive is not met");
  }

  return { eligible: reasons.length === 0, reasons };
};
