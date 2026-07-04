import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";
import { buildTestPdf } from "../helpers/buildTestPdf";

// pdf-parse v2 loads pdfjs-dist's worker via a dynamic import(), which Jest's
// CJS transform can't execute without --experimental-vm-modules. The real
// parser is exercised outside Jest (manual/dev-server smoke test); here we
// stub only the text extraction so the upload/storage/skill-sync plumbing
// around it is still verified end-to-end.
jest.mock("pdf-parse", () => ({
  PDFParse: jest.fn().mockImplementation(() => ({
    getText: async () => ({
      text: [
        "Resume Test",
        "Education",
        "B.Tech Computer Science, XYZ University",
        "Projects",
        "Built a placement portal using React and Node.js",
        "Skills",
        "React, SQL",
      ].join("\n"),
    }),
    destroy: async () => undefined,
  })),
}));

const app = createApp();

const studentEmail = "resume.test@college.edu";
let accessToken: string;

beforeAll(async () => {
  await request(app).post("/api/v1/auth/register/student").send({
    email: studentEmail,
    password: "Passw0rd!",
    fullName: "Resume Test",
    cgpa: 8.0,
    branch: "Computer Science",
    degree: "B.Tech",
    graduationYear: 2026,
  });

  await prisma.user.update({ where: { email: studentEmail }, data: { isEmailVerified: true } });

  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: studentEmail, password: "Passw0rd!" });
  accessToken = login.body.data.accessToken;

  await prisma.skill.upsert({
    where: { name: "React" },
    create: { name: "React" },
    update: {},
  });
});

afterAll(async () => {
  const user = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (user) {
    await prisma.resume.deleteMany({
      where: { student: { userId: user.id } },
    });
  }
  await prisma.user.deleteMany({ where: { email: studentEmail } });
  await prisma.$disconnect();
});

describe("Resume upload and parsing", () => {
  it("rejects non-PDF uploads", async () => {
    const res = await request(app)
      .post("/api/v1/students/me/resume")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("resume", Buffer.from("not a pdf"), { filename: "resume.txt", contentType: "text/plain" });

    expect(res.status).toBe(400);
  });

  it("parses a PDF resume and links matched skills", async () => {
    const pdfBuffer = await buildTestPdf([
      "Resume Test",
      "Education",
      "B.Tech Computer Science, XYZ University",
      "Projects",
      "Built a placement portal using React and Node.js",
      "Skills",
      "React, SQL",
    ]);

    const res = await request(app)
      .post("/api/v1/students/me/resume")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("resume", pdfBuffer, { filename: "resume.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(201);
    expect(res.body.data.resume.fileUrl).toMatch(/^\/uploads\/resumes\//);
    expect(res.body.data.matchedSkillNames).toContain("React");

    const profile = await request(app)
      .get("/api/v1/students/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(profile.body.data.resumeUrl).toBe(res.body.data.resume.fileUrl);
    expect(
      profile.body.data.skills.some((s: { skill: { name: string } }) => s.skill.name === "React")
    ).toBe(true);
  });

  it("fetches the latest resume", async () => {
    const res = await request(app)
      .get("/api/v1/students/me/resume")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.parsedEducation).toContain("XYZ University");
  });
});
