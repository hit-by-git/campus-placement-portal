import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";

const app = createApp();

const studentPayload = {
  email: "test.student@college.edu",
  password: "Passw0rd!",
  fullName: "Test Student",
  cgpa: 8.2,
  branch: "Computer Science",
  degree: "B.Tech",
  graduationYear: 2026,
};

afterAll(async () => {
  await prisma.company.deleteMany({
    where: { createdBy: { email: { contains: "@college.edu" } } },
  });
  await prisma.user.deleteMany({ where: { email: { contains: "@college.edu" } } });
  await prisma.$disconnect();
});

describe("Auth flow", () => {
  it("registers a student and rejects duplicate emails", async () => {
    const res = await request(app).post("/api/v1/auth/register/student").send(studentPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe(studentPayload.email);

    const dup = await request(app).post("/api/v1/auth/register/student").send(studentPayload);
    expect(dup.status).toBe(409);
  });

  it("rejects weak passwords at the validation layer", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register/student")
      .send({ ...studentPayload, email: "weak@college.edu", password: "weak" });
    expect(res.status).toBe(400);
  });

  it("blocks login before email verification", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: studentPayload.email, password: studentPayload.password });
    expect(res.status).toBe(403);
  });

  it("verifies email then logs in and refreshes the access token", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: studentPayload.email } });
    // Directly mark verified since the raw token is only known via the emailed link.
    await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: studentPayload.email, password: studentPayload.password });

    expect(login.status).toBe(200);
    expect(login.body.data.accessToken).toBeDefined();
    const cookies = login.headers["set-cookie"];
    expect(cookies).toBeDefined();

    const refresh = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", cookies as unknown as string[]);

    expect(refresh.status).toBe(200);
    expect(refresh.body.data.accessToken).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: studentPayload.email, password: "WrongPass1" });
    expect(res.status).toBe(401);
  });

  it("blocks recruiter login until approved", async () => {
    const recruiterPayload = {
      email: "test.recruiter@college.edu",
      password: "Passw0rd!",
      designation: "HR",
      companyName: "Test Co",
    };
    await request(app).post("/api/v1/auth/register/recruiter").send(recruiterPayload);
    const user = await prisma.user.findUniqueOrThrow({ where: { email: recruiterPayload.email } });
    await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: recruiterPayload.email, password: recruiterPayload.password });
    expect(res.status).toBe(403);
  });

  it("requireAuth rejects requests without a bearer token", async () => {
    const res = await request(app).post("/api/v1/auth/logout");
    expect(res.status).toBe(401);
  });
});
