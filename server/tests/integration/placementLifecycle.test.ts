import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";

const app = createApp();

const recruiterEmail = "lifecycle.recruiter@college.edu";
const studentEmail = "lifecycle.student@college.edu";

let recruiterToken: string;
let studentToken: string;
let companyId: string;
let driveId: string;
let applicationId: string;
let offerId: string;

beforeAll(async () => {
  await request(app).post("/api/v1/auth/register/recruiter").send({
    email: recruiterEmail,
    password: "Passw0rd!",
    designation: "HR",
    companyName: "Lifecycle Co",
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
    fullName: "Lifecycle Student",
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

  const drive = await request(app)
    .post("/api/v1/drives")
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({
      companyId,
      title: "Full Lifecycle SDE Role",
      jobDescription: "End-to-end test of the placement lifecycle from application to offer.",
      packageLPA: 15,
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
});

afterAll(async () => {
  await prisma.drive.deleteMany({ where: { companyId } });
  await prisma.company.deleteMany({ where: { id: companyId } });
  await prisma.user.deleteMany({ where: { email: { in: [recruiterEmail, studentEmail] } } });
  await prisma.$disconnect();
});

describe("Full placement lifecycle", () => {
  it("student applies to the published drive", async () => {
    const res = await request(app)
      .post("/api/v1/applications")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ driveId });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("APPLIED");
    applicationId = res.body.data.id;
  });

  it("rejects a duplicate application", async () => {
    const res = await request(app)
      .post("/api/v1/applications")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ driveId });
    expect(res.status).toBe(409);
  });

  it("recruiter sees the applicant in the drive's applicant list", async () => {
    const res = await request(app)
      .get(`/api/v1/drives/${driveId}/applicants`)
      .set("Authorization", `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some((a: { id: string }) => a.id === applicationId)).toBe(true);
  });

  it("recruiter shortlists the applicant", async () => {
    const res = await request(app)
      .patch(`/api/v1/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({ status: "SHORTLISTED" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("SHORTLISTED");
  });

  it("recruiter schedules an interview, moving the application to INTERVIEW", async () => {
    const res = await request(app)
      .post("/api/v1/interviews")
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({
        applicationId,
        round: 1,
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        mode: "ONLINE",
      });
    expect(res.status).toBe(201);

    const application = await request(app)
      .get(`/api/v1/applications/${applicationId}`)
      .set("Authorization", `Bearer ${studentToken}`);
    expect(application.body.data.status).toBe("INTERVIEW");
    expect(application.body.data.interviews.length).toBe(1);
  });

  it("recruiter extends an offer, moving the application to OFFERED", async () => {
    const res = await request(app)
      .post("/api/v1/offers")
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({ applicationId, packageLPA: 15 });
    expect(res.status).toBe(201);
    offerId = res.body.data.id;

    const application = await request(app)
      .get(`/api/v1/applications/${applicationId}`)
      .set("Authorization", `Bearer ${studentToken}`);
    expect(application.body.data.status).toBe("OFFERED");
  });

  it("recruiter uploads the offer letter", async () => {
    const res = await request(app)
      .post(`/api/v1/offers/${offerId}/offer-letter`)
      .set("Authorization", `Bearer ${recruiterToken}`)
      .attach("offerLetter", Buffer.from("%PDF-1.3 fake offer letter"), {
        filename: "offer.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(200);
    expect(res.body.data.offerLetterUrl).toMatch(/^\/uploads\/offer-letters\//);
  });

  it("blocks a student from responding to someone else's offer", async () => {
    const res = await request(app)
      .patch(`/api/v1/offers/${offerId}/respond`)
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({ status: "ACCEPTED" });
    expect(res.status).toBe(403);
  });

  it("student accepts the offer", async () => {
    const res = await request(app)
      .patch(`/api/v1/offers/${offerId}/respond`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ status: "ACCEPTED" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ACCEPTED");
  });

  it("blocks withdrawal once an application is offered", async () => {
    const res = await request(app)
      .patch(`/api/v1/applications/${applicationId}/withdraw`)
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(400);
  });
});
