export type Role = "STUDENT" | "RECRUITER" | "PLACEMENT_OFFICER";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Skill {
  id: string;
  name: string;
}

export interface StudentSkill {
  id: string;
  skillId: string;
  proficiency: number;
  skill: Skill;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string | null;
  url: string | null;
  issuedDate: string | null;
}

export interface Resume {
  id: string;
  fileUrl: string;
  parsedName: string | null;
  parsedEducation: string | null;
  parsedProjects: string | null;
  uploadedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  cgpa: number;
  branch: string;
  degree: string;
  graduationYear: number;
  activeBacklogs: number;
  gender: Gender | null;
  github: string | null;
  linkedin: string | null;
  bio: string | null;
  resumeUrl: string | null;
  skills: StudentSkill[];
  certificates: Certificate[];
  resumes: Resume[];
  user: { email: string; isEmailVerified: boolean };
}

export interface Company {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  createdAt: string;
}

export type DriveStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface Drive {
  id: string;
  companyId: string;
  company: { id: string; name: string; logoUrl: string | null };
  title: string;
  jobDescription: string;
  packageLPA: number;
  location: string;
  deadline: string;
  status: DriveStatus;
  minCgpa: number;
  allowedBranches: string[];
  allowedDegrees: string[];
  maxGraduationYear: number | null;
  maxBacklogs: number;
  genderRule: Gender | null;
  createdAt: string;
}

export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Interview {
  id: string;
  round: number;
  scheduledAt: string;
  mode: "ONLINE" | "IN_PERSON";
  location: string | null;
  feedback: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export type OfferStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface Offer {
  id: string;
  packageLPA: number;
  offerLetterUrl: string | null;
  status: OfferStatus;
  issuedAt: string;
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  drive: Drive;
  student: {
    id: string;
    fullName: string;
    cgpa: number;
    branch: string;
    degree: string;
    graduationYear: number;
    resumeUrl: string | null;
    user: { email: string };
  };
  interviews: Interview[];
  offer: Offer | null;
}

export type NotificationType =
  | "DRIVE_CREATED"
  | "APPLICATION_DEADLINE"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "OFFER_RECEIVED"
  | "RECRUITER_APPROVED"
  | "BROADCAST";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DriveRecommendation {
  drive: Drive;
  score: number;
  matchedSkills: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
