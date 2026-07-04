import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";

const app = createApp();

const recruiterEmail = "eligible.recruiter@college.edu";
const eligibleStudentEmail = "eligible.student@college.edu";
const ineligibleStudentEmail = "ineligible.student@college.edu";

let recruiterToken: string;
let eligibleStudentToken: string;
let ineligibleStudentToken: string;
let companyId: string;
let openDriveId: string;

const registerStudent = async (email: string, cgpa: number, branch: string) => {
  await request(app).post("/api/v1/auth/register/student").send({
    email,
    password: "Passw0rd!",
    fullName: email,
    cgpa,
    branch,
    degree: "B.Tech",
    graduationYear: 2026,
  });
  await prisma.user.update({ where: { email }, data: { isEmailVerified: true } });
  const login = await request(app).post("/api/v1/auth/login").send({ email, password: "Passw0rd!" });
  return login.body.data.accessToken as string;
};

beforeAll(async () => {
  await request(app).post("/api/v1/auth/register/recruiter").send({
    email: recruiterEmail,
    password: "Passw0rd!",
    designation: "HR",
    companyName: "Eligibility Test Co",
  });
  const recruiterUser = await prisma.user.findUniqueOrThrow({ where: { email: recruiterEmail } });
  await prisma.user.update({ where: { id: recruiterUser.id }, data: { isEmailVerified: true } });
  await prisma.recruiterProfile.update({
    where: { userId: recruiterUser.id },
    data: { isApproved: true },
  });
  const recruiterLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: recruiterEmail, password: "Passw0rd!" });
  recruiterToken = recruiterLogin.body.data.accessToken;

  const recruiterProfile = await prisma.recruiterProfile.findUniqueOrThrow({
    where: { userId: recruiterUser.id },
  });
  companyId = recruiterProfile.companyId!;

  eligibleStudentToken = await registerStudent(eligibleStudentEmail, 8.5, "Computer Science");
  ineligibleStudentToken = await registerStudent(ineligibleStudentEmail, 6.0, "Mechanical");

  const drive = await request(app)
    .post("/api/v1/drives")
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({
      companyId,
      title: "Eligibility Test Drive",
      jobDescription: "A drive used purely to validate the eligibility engine end-to-end.",
      packageLPA: 8,
      location: "Bangalore",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      minCgpa: 7.5,
      allowedBranches: ["Computer Science"],
      allowedDegrees: ["B.Tech"],
      maxBacklogs: 0,
    });
  openDriveId = drive.body.data.id;

  await request(app)
    .patch(`/api/v1/drives/${openDriveId}`)
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({ status: "PUBLISHED" });
});

afterAll(async () => {
  await prisma.drive.deleteMany({ where: { companyId } });
  await prisma.company.deleteMany({ where: { id: companyId } });
  await prisma.user.deleteMany({
    where: { email: { in: [recruiterEmail, eligibleStudentEmail, ineligibleStudentEmail] } },
  });
  await prisma.$disconnect();
});

describe("Eligibility engine endpoints", () => {
  it("includes the drive in the eligible student's list", async () => {
    const res = await request(app)
      .get("/api/v1/drives/eligible")
      .set("Authorization", `Bearer ${eligibleStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((d: { id: string }) => d.id === openDriveId)).toBe(true);
  });

  it("excludes the drive from the ineligible student's list", async () => {
    const res = await request(app)
      .get("/api/v1/drives/eligible")
      .set("Authorization", `Bearer ${ineligibleStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((d: { id: string }) => d.id === openDriveId)).toBe(false);
  });

  it("explains why an ineligible student cannot apply", async () => {
    const res = await request(app)
      .get(`/api/v1/drives/${openDriveId}/eligibility`)
      .set("Authorization", `Bearer ${ineligibleStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.eligible).toBe(false);
    expect(res.body.data.reasons.length).toBeGreaterThan(0);
  });

  it("confirms eligibility for a matching student", async () => {
    const res = await request(app)
      .get(`/api/v1/drives/${openDriveId}/eligibility`)
      .set("Authorization", `Bearer ${eligibleStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ eligible: true, reasons: [] });
  });

  it("blocks recruiters from checking eligibility (student-only route)", async () => {
    const res = await request(app)
      .get(`/api/v1/drives/${openDriveId}/eligibility`)
      .set("Authorization", `Bearer ${recruiterToken}`);
    expect(res.status).toBe(403);
  });
});
