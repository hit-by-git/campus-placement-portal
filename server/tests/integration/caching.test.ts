import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";
import { redis } from "../../src/config/redis";

const app = createApp();

const recruiterEmail = "cache.recruiter@college.edu";
let recruiterToken: string;
let companyId: string;

beforeAll(async () => {
  await request(app).post("/api/v1/auth/register/recruiter").send({
    email: recruiterEmail,
    password: "Passw0rd!",
    designation: "HR",
    companyName: "Cache Test Co",
  });
  const recruiterUser = await prisma.user.findUniqueOrThrow({ where: { email: recruiterEmail } });
  await prisma.user.update({ where: { id: recruiterUser.id }, data: { isEmailVerified: true } });
  await prisma.recruiterProfile.update({
    where: { userId: recruiterUser.id },
    data: { isApproved: true },
  });
  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: recruiterEmail, password: "Passw0rd!" });
  recruiterToken = login.body.data.accessToken;
  const recruiterProfile = await prisma.recruiterProfile.findUniqueOrThrow({
    where: { userId: recruiterUser.id },
  });
  companyId = recruiterProfile.companyId!;
});

afterAll(async () => {
  await prisma.company.deleteMany({ where: { id: companyId } });
  await prisma.user.deleteMany({ where: { email: recruiterEmail } });
  await prisma.$disconnect();
});

describe("Redis caching for list endpoints", () => {
  it("writes a cache entry for GET /companies and reuses it on the next call", async () => {
    await redis.flushall();

    const first = await request(app)
      .get("/api/v1/companies")
      .set("Authorization", `Bearer ${recruiterToken}`);
    expect(first.status).toBe(200);

    const keys = await redis.keys("companies:list:*");
    expect(keys.length).toBeGreaterThan(0);

    const second = await request(app)
      .get("/api/v1/companies")
      .set("Authorization", `Bearer ${recruiterToken}`);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });

  it("invalidates the companies cache when a company is updated", async () => {
    await request(app)
      .get("/api/v1/companies")
      .set("Authorization", `Bearer ${recruiterToken}`);
    expect((await redis.keys("companies:list:*")).length).toBeGreaterThan(0);

    await request(app)
      .patch(`/api/v1/companies/${companyId}`)
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({ description: "Freshly updated" });

    expect(await redis.keys("companies:list:*")).toHaveLength(0);

    const after = await request(app)
      .get("/api/v1/companies")
      .set("Authorization", `Bearer ${recruiterToken}`);
    const updated = after.body.data.find((c: { id: string }) => c.id === companyId);
    expect(updated.description).toBe("Freshly updated");
  });
});
