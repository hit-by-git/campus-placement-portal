import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/config/prisma";
import bcrypt from "bcryptjs";

const app = createApp();

const recruiterEmail = "notif.recruiter@college.edu";
const studentEmail = "notif.student@college.edu";
const adminEmail = "notif.admin@college.edu";

let adminToken: string;
let recruiterToken: string;
let studentToken: string;
let companyId: string;
let driveId: string;

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
    companyName: "Notification Test Co",
  });
  const recruiterUser = await prisma.user.findUniqueOrThrow({ where: { email: recruiterEmail } });
  await prisma.user.update({ where: { id: recruiterUser.id }, data: { isEmailVerified: true } });

  await request(app).post("/api/v1/auth/register/student").send({
    email: studentEmail,
    password: "Passw0rd!",
    fullName: "Notification Student",
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
});

afterAll(async () => {
  await prisma.drive.deleteMany({ where: { companyId } });
  await prisma.company.deleteMany({ where: { id: companyId } });
  await prisma.notification.deleteMany({
    where: { user: { email: { in: [studentEmail, recruiterEmail, adminEmail] } } },
  });
  await prisma.user.deleteMany({ where: { email: { in: [studentEmail, recruiterEmail, adminEmail] } } });
  await prisma.$disconnect();
});

describe("Admin recruiter approval and notification triggers", () => {
  it("blocks recruiter login before approval", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: recruiterEmail, password: "Passw0rd!" });
    expect(res.status).toBe(403);
  });

  it("lists the recruiter under pending approvals", async () => {
    const res = await request(app)
      .get("/api/v1/admin/recruiters/pending")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some((r: { user: { email: string } }) => r.user.email === recruiterEmail)).toBe(
      true
    );
  });

  it("approves the recruiter and notifies them", async () => {
    const recruiterUser = await prisma.user.findUniqueOrThrow({ where: { email: recruiterEmail } });
    const res = await request(app)
      .patch(`/api/v1/admin/recruiters/${recruiterUser.id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isApproved).toBe(true);

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: recruiterEmail, password: "Passw0rd!" });
    expect(login.status).toBe(200);
    recruiterToken = login.body.data.accessToken;

    const recruiterProfile = await prisma.recruiterProfile.findUniqueOrThrow({
      where: { userId: recruiterUser.id },
    });
    companyId = recruiterProfile.companyId!;

    const notifications = await request(app)
      .get("/api/v1/notifications/me")
      .set("Authorization", `Bearer ${recruiterToken}`);
    expect(
      notifications.body.data.items.some((n: { type: string }) => n.type === "RECRUITER_APPROVED")
    ).toBe(true);
  });

  it("notifies eligible students when a matching drive is published", async () => {
    const drive = await request(app)
      .post("/api/v1/drives")
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({
        companyId,
        title: "Notification Test Drive",
        jobDescription: "Validates that publishing a drive notifies eligible students.",
        packageLPA: 8,
        location: "Remote",
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

    const notifications = await request(app)
      .get("/api/v1/notifications/me")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(
      notifications.body.data.items.some((n: { type: string }) => n.type === "DRIVE_CREATED")
    ).toBe(true);
    expect(notifications.body.data.unreadCount).toBeGreaterThan(0);
  });

  it("marks a notification as read", async () => {
    const list = await request(app)
      .get("/api/v1/notifications/me")
      .set("Authorization", `Bearer ${studentToken}`);
    const notificationId = list.body.data.items[0].id;

    const res = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isRead).toBe(true);
  });

  it("blocks a student from broadcasting", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/broadcast")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ title: "Hello", message: "Should fail" });
    expect(res.status).toBe(403);
  });

  it("lets the admin broadcast to all students", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/broadcast")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Placement Drive Week", message: "Multiple drives open this week!", audience: "STUDENTS" });
    expect(res.status).toBe(201);
    expect(res.body.data.notified).toBeGreaterThan(0);

    const notifications = await request(app)
      .get("/api/v1/notifications/me?unread=true")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(
      notifications.body.data.items.some((n: { type: string }) => n.type === "BROADCAST")
    ).toBe(true);
  });
});
