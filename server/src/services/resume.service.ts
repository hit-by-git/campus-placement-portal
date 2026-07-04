import { studentRepository } from "../repositories/student.repository";
import { resumeRepository } from "../repositories/resume.repository";
import { resumeParserService } from "./resumeParser.service";
import { storageService } from "./storage";
import { ApiError } from "../utils/ApiError";

export const resumeService = {
  async uploadAndParse(userId: string, file: Express.Multer.File | undefined) {
    if (!file) throw ApiError.badRequest("A PDF resume file is required");

    const profile = await studentRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound("Student profile not found");

    const candidateSkillNames = await studentRepository.listAllSkillNames();
    const { parsedName, parsedEducation, parsedProjects, matchedSkillNames } =
      await resumeParserService.parse(file.buffer, candidateSkillNames);

    const stored = await storageService.save(
      { buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype },
      `resumes/${profile.id}`
    );

    const resume = await resumeRepository.create({
      studentId: profile.id,
      fileUrl: stored.url,
      parsedName,
      parsedEducation,
      parsedProjects,
    });

    await studentRepository.updateProfile(profile.id, { resumeUrl: stored.url });

    for (const skillName of matchedSkillNames) {
      const skill = await studentRepository.upsertSkillByName(skillName);
      await studentRepository.ensureSkillLinked(profile.id, skill.id);
    }

    return { resume, matchedSkillNames };
  },

  async getLatest(userId: string) {
    const profile = await studentRepository.findByUserId(userId);
    if (!profile) throw ApiError.notFound("Student profile not found");

    const resume = await resumeRepository.findLatestByStudentId(profile.id);
    if (!resume) throw ApiError.notFound("No resume uploaded yet");
    return resume;
  },
};
