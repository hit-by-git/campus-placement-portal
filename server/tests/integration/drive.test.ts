import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";

const app = createApp();

const recruiterEmail = "drive.recruiter@college.edu";
const otherRecruiterEmail = "drive.other@college.edu";
let recruiterToken: string;
let otherRecruiterToken: string;
let companyId: string;
let driveId: string;

const registerApprovedRecruiter = async (email: string, companyName: string) => {
  await request(app).post("/api/v1/auth/register/recruiter").send({
    email,
    password: "Passw0rd!",
    designation: "HR",
    companyName,
  });
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });
  await prisma.recruiterProfile.update({ where: { userId: user.id }, data: { isApproved: true } });

  const login = await request(app).post("/api/v1/auth/login").send({ email, password: "Passw0rd!" });
  const profile = await prisma.recruiterProfile.findUniqueOrThrow({ where: { userId: user.id } });
  return { token: login.body.data.accessToken as string, companyId: profile.companyId as string };
};

beforeAll(async () => {
  const recruiter = await registerApprovedRecruiter(recruiterEmail, "Drive Test Co");
  recruiterToken = recruiter.token;
  companyId = recruiter.companyId;

  const other = await registerApprovedRecruiter(otherRecruiterEmail, "Other Co");
  otherRecruiterToken = other.token;
});

afterAll(async () => {
  await prisma.drive.deleteMany({ where: { company: { name: { contains: "Test Co" } } } });
  await prisma.company.deleteMany({ where: { name: { in: ["Drive Test Co", "Other Co"] } } });
  await prisma.user.deleteMany({ where: { email: { in: [recruiterEmail, otherRecruiterEmail] } } });
  await prisma.$disconnect();
});

describe("Company and Drive CRUD", () => {
  it("lets a recruiter create a drive for their own company", async () => {
    const res = await request(app)
      .post("/api/v1/drives")
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({
        companyId,
        title: "Backend Engineer",
        jobDescription: "Build APIs with Node.js and PostgreSQL.",
        packageLPA: 10,
        location: "Bangalore",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        minCgpa: 7,
        allowedBranches: ["Computer Science"],
        allowedDegrees: ["B.Tech"],
        maxBacklogs: 0,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("DRAFT");
    driveId = res.body.data.id;
  });

  it("blocks a recruiter from creating a drive for a company they don't own", async () => {
    const res = await request(app)
      .post("/api/v1/drives")
      .set("Authorization", `Bearer ${otherRecruiterToken}`)
      .send({
        companyId,
        title: "Should Fail",
        jobDescription: "Attempting cross-company drive creation.",
        packageLPA: 5,
        location: "Remote",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    expect(res.status).toBe(403);
  });

  it("blocks a recruiter from updating another company's drive", async () => {
    const res = await request(app)
      .patch(`/api/v1/drives/${driveId}`)
      .set("Authorization", `Bearer ${otherRecruiterToken}`)
      .send({ status: "PUBLISHED" });

    expect(res.status).toBe(403);
  });

  it("lets the owning recruiter publish their drive", async () => {
    const res = await request(app)
      .patch(`/api/v1/drives/${driveId}`)
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({ status: "PUBLISHED" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("PUBLISHED");
  });

  it("lists and filters drives", async () => {
    const res = await request(app)
      .get("/api/v1/drives?status=PUBLISHED&search=Backend")
      .set("Authorization", `Bearer ${recruiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((d: { id: string }) => d.id === driveId)).toBe(true);
  });

  it("sorts drives by package ascending and descending", async () => {
    await request(app)
      .post("/api/v1/drives")
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({
        companyId,
        title: "Junior Backend Engineer",
        jobDescription: "A lower-package drive used to validate sorting behavior.",
        packageLPA: 4,
        location: "Bangalore",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    const asc = await request(app)
      .get(`/api/v1/drives?companyId=${companyId}&sortBy=packageLPA&sortOrder=asc`)
      .set("Authorization", `Bearer ${recruiterToken}`);
    const ascPackages = asc.body.data.map((d: { packageLPA: number }) => d.packageLPA);
    expect(ascPackages).toEqual([...ascPackages].sort((a, b) => a - b));

    const desc = await request(app)
      .get(`/api/v1/drives?companyId=${companyId}&sortBy=packageLPA&sortOrder=desc`)
      .set("Authorization", `Bearer ${recruiterToken}`);
    const descPackages = desc.body.data.map((d: { packageLPA: number }) => d.packageLPA);
    expect(descPackages).toEqual([...descPackages].sort((a, b) => b - a));
  });

  it("blocks a non-owning recruiter from deleting the drive", async () => {
    const res = await request(app)
      .delete(`/api/v1/drives/${driveId}`)
      .set("Authorization", `Bearer ${otherRecruiterToken}`);
    expect(res.status).toBe(403);
  });

  it("blocks a recruiter from updating a company they don't own", async () => {
    const res = await request(app)
      .patch(`/api/v1/companies/${companyId}`)
      .set("Authorization", `Bearer ${otherRecruiterToken}`)
      .send({ description: "Hijacked description" });
    expect(res.status).toBe(403);
  });

  it("lets the owning recruiter update their company", async () => {
    const res = await request(app)
      .patch(`/api/v1/companies/${companyId}`)
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({ description: "Updated description" });
    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe("Updated description");
  });
});
