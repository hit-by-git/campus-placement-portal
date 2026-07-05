import { Drive } from "@prisma/client";
import { studentRepository } from "../repositories/student.repository";
import { driveRepository } from "../repositories/drive.repository";
import { applicationRepository } from "../repositories/application.repository";
import { ApiError } from "../utils/ApiError";
import { evaluateEligibility } from "./eligibility.service";
import { matchSkillsInText } from "../utils/skillMatcher";

export const SKILL_WEIGHT = 0.6;
export const CGPA_WEIGHT = 0.25;
export const PACKAGE_WEIGHT = 0.15;
export const CGPA_MARGIN_RANGE = 3;

export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const jaccardSimilarity = (a: Set<string>, b: Set<string>): number => {
  if (b.size === 0) return 0.5; // No extractable skill keywords: stay neutral rather than penalize.
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
};

export interface DriveRecommendation {
  drive: Drive & { company: { id: string; name: string; logoUrl: string | null } };
  score: number;
  matchedSkills: string[];
}

/**
 * Pure scoring function (no I/O): weighted blend of skill-set Jaccard
 * similarity, CGPA headroom above the drive's cutoff, and relative package,
 * against a single candidate drive.
 */
export const scoreDrive = (
  student: { cgpa: number; skillNames: Set<string> },
  drive: { minCgpa: number; packageLPA: number },
  driveSkillNames: Set<string>,
  maxPackage: number
): number => {
  const skillScore = jaccardSimilarity(student.skillNames, driveSkillNames);
  const cgpaMarginScore = clamp01((student.cgpa - drive.minCgpa) / CGPA_MARGIN_RANGE);
  const packageScore = maxPackage === 0 ? 0 : drive.packageLPA / maxPackage;

  const score = SKILL_WEIGHT * skillScore + CGPA_WEIGHT * cgpaMarginScore + PACKAGE_WEIGHT * packageScore;
  return Math.round(score * 100) / 100;
};

export const recommendationService = {
  /**
   * Content-based recommender: ranks open drives the student is eligible for
   * and hasn't applied to, by skill-set similarity (Jaccard over the student's
   * skills vs. keywords extracted from the job description), CGPA headroom
   * above the drive's cutoff, and relative package. No external ML service —
   * plain, explainable TypeScript scoring.
   */
  async recommendDrivesForStudent(userId: string, limit = 10): Promise<DriveRecommendation[]> {
    const profile = await studentRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound("Student profile not found");

    const [openDrives, appliedDriveIds, allSkillNames] = await Promise.all([
      driveRepository.findOpenDrives(),
      applicationRepository.findAppliedDriveIds(profile.id),
      studentRepository.listAllSkillNames(),
    ]);

    const appliedSet = new Set(appliedDriveIds);
    const candidates = openDrives.filter(
      (drive) => !appliedSet.has(drive.id) && evaluateEligibility(profile, drive).eligible
    );

    if (candidates.length === 0) return [];

    const studentSkillNames = new Set(profile.skills.map((s) => s.skill.name.toLowerCase()));
    const maxPackage = Math.max(...candidates.map((d) => d.packageLPA), 0);

    const scored = candidates.map((drive) => {
      const matchedSkills = matchSkillsInText(`${drive.title} ${drive.jobDescription}`, allSkillNames);
      const driveSkillNames = new Set(matchedSkills.map((s) => s.toLowerCase()));
      const score = scoreDrive(
        { cgpa: profile.cgpa, skillNames: studentSkillNames },
        drive,
        driveSkillNames,
        maxPackage
      );

      return { drive, score, matchedSkills };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  },
};
