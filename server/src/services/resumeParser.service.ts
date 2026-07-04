import { PDFParse } from "pdf-parse";
import { matchSkillsInText } from "../utils/skillMatcher";

const SECTION_MAX_LENGTH = 1500;

const EDUCATION_HEADERS = ["education", "academic background", "academics"];
const PROJECT_HEADERS = ["projects", "project experience", "personal projects"];
const ALL_SECTION_HEADERS = [
  ...EDUCATION_HEADERS,
  ...PROJECT_HEADERS,
  "experience",
  "work experience",
  "skills",
  "technical skills",
  "certifications",
  "achievements",
];

const isSectionHeaderLine = (line: string, headers: string[]) => {
  const normalized = line.trim().toLowerCase();
  return headers.some((header) => normalized === header || normalized.startsWith(`${header}:`));
};

const extractSection = (lines: string[], startHeaders: string[]): string | null => {
  const startIndex = lines.findIndex((line) => isSectionHeaderLine(line, startHeaders));
  if (startIndex === -1) return null;

  const collected: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (isSectionHeaderLine(lines[i], ALL_SECTION_HEADERS)) break;
    if (lines[i].trim()) collected.push(lines[i].trim());
  }

  return collected.join(" ").slice(0, SECTION_MAX_LENGTH) || null;
};

export interface ParsedResume {
  parsedName: string | null;
  parsedEducation: string | null;
  parsedProjects: string | null;
  matchedSkillNames: string[];
}

export const resumeParserService = {
  async parse(buffer: Buffer, candidateSkillNames: string[]): Promise<ParsedResume> {
    const parser = new PDFParse({ data: buffer });
    let text: string;
    try {
      ({ text } = await parser.getText());
    } finally {
      await parser.destroy();
    }
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const parsedName = lines[0]?.slice(0, 100) ?? null;
    const parsedEducation = extractSection(lines, EDUCATION_HEADERS);
    const parsedProjects = extractSection(lines, PROJECT_HEADERS);
    const matchedSkillNames = matchSkillsInText(text, candidateSkillNames);

    return { parsedName, parsedEducation, parsedProjects, matchedSkillNames };
  },
};
