import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";

const app = createApp();

const studentEmail = "profile.test@college.edu";
let accessToken: string;

beforeAll(async () => {
  await request(app).post("/api/v1/auth/register/student").send({
    email: studentEmail,
    password: "Passw0rd!",
    fullName: "Profile Test",
    cgpa: 7.9,
    branch: "Computer Science",
    degree: "B.Tech",
    graduationYear: 2026,
  });

  await prisma.user.update({ where: { email: studentEmail }, data: { isEmailVerified: true } });

  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: studentEmail, password: "Passw0rd!" });
  accessToken = login.body.data.accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: studentEmail } });
  await prisma.$disconnect();
});

const auth = (req: request.Test) => req.set("Authorization", `Bearer ${accessToken}`);

describe("Student profile", () => {
  it("fetches the logged-in student's own profile", async () => {
    const res = await auth(request(app).get("/api/v1/students/me"));
    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe("Profile Test");
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/v1/students/me");
    expect(res.status).toBe(401);
  });

  it("updates profile fields", async () => {
    const res = await auth(request(app).patch("/api/v1/students/me")).send({ bio: "Aspiring SDE" });
    expect(res.status).toBe(200);
    expect(res.body.data.bio).toBe("Aspiring SDE");
  });

  it("adds and removes a skill", async () => {
    const add = await auth(request(app).post("/api/v1/students/me/skills")).send({
      name: "Kubernetes",
      proficiency: 2,
    });
    expect(add.status).toBe(201);
    const skillId = add.body.data.skillId;

    const profile = await auth(request(app).get("/api/v1/students/me"));
    expect(profile.body.data.skills.some((s: { skillId: string }) => s.skillId === skillId)).toBe(true);

    const remove = await auth(request(app).delete(`/api/v1/students/me/skills/${skillId}`));
    expect(remove.status).toBe(200);
  });

  it("adds, updates and deletes a certificate", async () => {
    const add = await auth(request(app).post("/api/v1/students/me/certificates")).send({
      title: "AWS Certified Developer",
      issuer: "Amazon",
    });
    expect(add.status).toBe(201);
    const certificateId = add.body.data.id;

    const update = await auth(
      request(app).patch(`/api/v1/students/me/certificates/${certificateId}`)
    ).send({ issuer: "AWS" });
    expect(update.status).toBe(200);
    expect(update.body.data.issuer).toBe("AWS");

    const del = await auth(request(app).delete(`/api/v1/students/me/certificates/${certificateId}`));
    expect(del.status).toBe(200);
  });

  it("blocks admin-only student list for students", async () => {
    const res = await auth(request(app).get("/api/v1/students"));
    expect(res.status).toBe(403);
  });

  it("allows a placement officer to search and paginate the student list", async () => {
    const bcrypt = await import("bcryptjs");
    const officer = await prisma.user.create({
      data: {
        email: "officer.test@college.edu",
        passwordHash: await bcrypt.hash("Passw0rd!", 10),
        role: "PLACEMENT_OFFICER",
        isEmailVerified: true,
      },
    });

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: officer.email, password: "Passw0rd!" });
    const officerToken = login.body.data.accessToken;

    const res = await request(app)
      .get("/api/v1/students?search=Profile&page=1&limit=5")
      .set("Authorization", `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.data.some((s: { fullName: string }) => s.fullName === "Profile Test")).toBe(true);

    await prisma.user.delete({ where: { id: officer.id } });
  });
});
