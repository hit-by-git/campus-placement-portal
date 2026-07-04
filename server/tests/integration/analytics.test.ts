import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";

const app = createApp();

const recruiterEmail = "analytics.recruiter@college.edu";
const studentEmail = "analytics.student@college.edu";
const adminEmail = "analytics.admin@college.edu";

let adminToken: string;
let recruiterToken: string;
let studentToken: string;
let companyId: string;
let driveId: string;
let applicationId: string;
let offerId: string;

beforeAll(async () => {
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash("Passw0rd!", 10),
      role: "PLACEMENT_OFFICER",
      isEmailVerified: true,
    },
  });
  const adminLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: admin.email, password: "Passw0rd!" });
  adminToken = adminLogin.body.data.accessToken;

  await request(app).post("/api/v1/auth/register/recruiter").send({
    email: recruiterEmail,
    password: "Passw0rd!",
    designation: "HR",
    companyName: "Analytics Test Co",
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

  await request(app).post("/api/v1/auth/register/student").send({
    email: studentEmail,
    password: "Passw0rd!",
    fullName: "Analytics Student",
    cgpa: 9,
    branch: "Computer Science",
    degree: "B.Tech",
    graduationYear: 2026,
  });
  await prisma.user.update({ where: { email: studentEmail }, data: { isEmailVerified: true } });
  const studentLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: studentEmail, password: "Passw0rd!" });
  studentToken = studentLogin.body.data.accessToken;

  await request(app)
    .post("/api/v1/students/me/skills")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ name: "Analytics Skill", proficiency: 3 });

  const drive = await request(app)
    .post("/api/v1/drives")
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({
      companyId,
      title: "Analytics Test Drive",
      jobDescription: "A drive used to validate analytics aggregation end-to-end.",
      packageLPA: 20,
      location: "Bangalore",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      minCgpa: 7,
      allowedBranches: ["Computer Science"],
      allowedDegrees: ["B.Tech"],
      maxBacklogs: 0,
    });
  driveId = drive.body.data.id;

  await request(app)
    .patch(`/api/v1/drives/${driveId}`)
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({ status: "PUBLISHED" });

  const application = await request(app)
    .post("/api/v1/applications")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ driveId });
  applicationId = application.body.data.id;

  await request(app)
    .patch(`/api/v1/applications/${applicationId}/status`)
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({ status: "SHORTLISTED" });

  const offer = await request(app)
    .post("/api/v1/offers")
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({ applicationId, packageLPA: 20 });
  offerId = offer.body.data.id;

  await request(app)
    .patch(`/api/v1/offers/${offerId}/respond`)
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ status: "ACCEPTED" });
});

afterAll(async () => {
  await prisma.drive.deleteMany({ where: { companyId } });
  await prisma.company.deleteMany({ where: { id: companyId } });
  await prisma.user.deleteMany({
    where: { email: { in: [recruiterEmail, studentEmail, adminEmail] } },
  });
  await prisma.$disconnect();
});

describe("Analytics and CSV export", () => {
  it("blocks non-admins from viewing analytics", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/overview")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it("computes placement overview including the accepted offer", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/overview")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.placedStudents).toBeGreaterThanOrEqual(1);
    expect(res.body.data.highestPackageLPA).toBeGreaterThanOrEqual(20);
    expect(res.body.data.placementPercentage).toBeGreaterThan(0);
  });

  it("reports applications per company", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/applications-per-company")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const entry = res.body.data.find((c: { companyId: string }) => c.companyId === companyId);
    expect(entry.applicationCount).toBeGreaterThanOrEqual(1);
  });

  it("reports skill distribution", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/skill-distribution")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(
      res.body.data.some((s: { skillName: string }) => s.skillName === "Analytics Skill")
    ).toBe(true);
  });

  it("exports students as CSV", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/export/students")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.text).toContain("Analytics Student");
    expect(res.text.split("\n")[0]).toBe("Name,Email,Branch,Degree,CGPA,Graduation Year,Active Backlogs,Resume URL");
  });

  it("exports accepted placements as CSV", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/export/placements")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain("Analytics Test Co");
    expect(res.text).toContain("ACCEPTED");
  });
});
