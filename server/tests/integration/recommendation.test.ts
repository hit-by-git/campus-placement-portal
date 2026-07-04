import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";

const app = createApp();

const recruiterEmail = "reco.recruiter@college.edu";
const studentEmail = "reco.student@college.edu";

let recruiterToken: string;
let studentToken: string;
let companyId: string;
let reactDriveId: string;
let unrelatedDriveId: string;

beforeAll(async () => {
  await request(app).post("/api/v1/auth/register/recruiter").send({
    email: recruiterEmail,
    password: "Passw0rd!",
    designation: "HR",
    companyName: "Recommendation Test Co",
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
    fullName: "Recommendation Student",
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

  await prisma.skill.upsert({ where: { name: "React" }, create: { name: "React" }, update: {} });
  await prisma.skill.upsert({
    where: { name: "Machine Learning" },
    create: { name: "Machine Learning" },
    update: {},
  });

  await request(app)
    .post("/api/v1/students/me/skills")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ name: "React", proficiency: 4 });

  const reactDrive = await request(app)
    .post("/api/v1/drives")
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({
      companyId,
      title: "Frontend Engineer",
      jobDescription: "Build UIs with React and TypeScript. React experience is a strong plus.",
      packageLPA: 12,
      location: "Bangalore",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      minCgpa: 7,
      allowedBranches: ["Computer Science"],
      allowedDegrees: ["B.Tech"],
    });
  reactDriveId = reactDrive.body.data.id;
  await request(app)
    .patch(`/api/v1/drives/${reactDriveId}`)
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({ status: "PUBLISHED" });

  const unrelatedDrive = await request(app)
    .post("/api/v1/drives")
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({
      companyId,
      title: "ML Research Engineer",
      jobDescription: "Deep expertise in Machine Learning and statistical modeling required.",
      packageLPA: 12,
      location: "Bangalore",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      minCgpa: 7,
      allowedBranches: ["Computer Science"],
      allowedDegrees: ["B.Tech"],
    });
  unrelatedDriveId = unrelatedDrive.body.data.id;
  await request(app)
    .patch(`/api/v1/drives/${unrelatedDriveId}`)
    .set("Authorization", `Bearer ${recruiterToken}`)
    .send({ status: "PUBLISHED" });
});

afterAll(async () => {
  await prisma.drive.deleteMany({ where: { companyId } });
  await prisma.company.deleteMany({ where: { id: companyId } });
  await prisma.user.deleteMany({ where: { email: { in: [recruiterEmail, studentEmail] } } });
  await prisma.$disconnect();
});

describe("Drive recommendation engine", () => {
  it("ranks the skill-matching drive above the unrelated one", async () => {
    const res = await request(app)
      .get("/api/v1/recommendations/drives")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    const ids = res.body.data.map((r: { drive: { id: string } }) => r.drive.id);
    expect(ids).toContain(reactDriveId);
    expect(ids).toContain(unrelatedDriveId);

    const reactEntry = res.body.data.find((r: { drive: { id: string } }) => r.drive.id === reactDriveId);
    const mlEntry = res.body.data.find((r: { drive: { id: string } }) => r.drive.id === unrelatedDriveId);
    expect(reactEntry.score).toBeGreaterThan(mlEntry.score);
    expect(reactEntry.matchedSkills).toContain("React");
  });

  it("excludes a drive once the student has applied to it", async () => {
    await request(app)
      .post("/api/v1/applications")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ driveId: reactDriveId });

    const res = await request(app)
      .get("/api/v1/recommendations/drives")
      .set("Authorization", `Bearer ${studentToken}`);

    const ids = res.body.data.map((r: { drive: { id: string } }) => r.drive.id);
    expect(ids).not.toContain(reactDriveId);
  });

  it("blocks recruiters from requesting student recommendations", async () => {
    const res = await request(app)
      .get("/api/v1/recommendations/drives")
      .set("Authorization", `Bearer ${recruiterToken}`);
    expect(res.status).toBe(403);
  });
});
