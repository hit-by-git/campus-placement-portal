import { PrismaClient, Role, DriveStatus, ApplicationStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SKILL_NAMES = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "SQL",
  "Machine Learning",
  "AWS",
  "Docker",
  "System Design",
];

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding database...");

  await prisma.notification.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.drive.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  const skills = await Promise.all(
    SKILL_NAMES.map((name) => prisma.skill.create({ data: { name } }))
  );
  const skillByName = Object.fromEntries(skills.map((s) => [s.name, s]));

  await prisma.user.create({
    data: {
      email: "admin@placement.edu",
      passwordHash: await hash("Admin@123"),
      role: Role.PLACEMENT_OFFICER,
      isEmailVerified: true,
    },
  });

  const recruiterUser = await prisma.user.create({
    data: {
      email: "recruiter@techcorp.com",
      passwordHash: await hash("Recruiter@123"),
      role: Role.RECRUITER,
      isEmailVerified: true,
    },
  });

  const company = await prisma.company.create({
    data: {
      name: "TechCorp Solutions",
      description: "A product-based software company building developer tools.",
      website: "https://techcorp.example.com",
      createdByUserId: recruiterUser.id,
    },
  });

  await prisma.recruiterProfile.create({
    data: {
      userId: recruiterUser.id,
      designation: "Senior Talent Acquisition Partner",
      companyId: company.id,
      isApproved: true,
    },
  });

  const pendingRecruiterUser = await prisma.user.create({
    data: {
      email: "recruiter@financeplus.com",
      passwordHash: await hash("Recruiter@123"),
      role: Role.RECRUITER,
      isEmailVerified: true,
    },
  });

  const secondCompany = await prisma.company.create({
    data: {
      name: "FinancePlus Analytics",
      description: "Fintech company hiring analysts and backend engineers.",
      website: "https://financeplus.example.com",
      createdByUserId: pendingRecruiterUser.id,
    },
  });

  await prisma.recruiterProfile.create({
    data: {
      userId: pendingRecruiterUser.id,
      designation: "HR Manager",
      companyId: secondCompany.id,
      isApproved: false,
    },
  });

  const studentsData = [
    {
      email: "aarav.sharma@college.edu",
      fullName: "Aarav Sharma",
      cgpa: 8.7,
      branch: "Computer Science",
      degree: "B.Tech",
      graduationYear: 2026,
      activeBacklogs: 0,
      skillNames: ["JavaScript", "React", "Node.js", "SQL"],
    },
    {
      email: "diya.patel@college.edu",
      fullName: "Diya Patel",
      cgpa: 9.2,
      branch: "Computer Science",
      degree: "B.Tech",
      graduationYear: 2026,
      activeBacklogs: 0,
      skillNames: ["Python", "Machine Learning", "SQL", "AWS"],
    },
    {
      email: "rohan.iyer@college.edu",
      fullName: "Rohan Iyer",
      cgpa: 7.4,
      branch: "Electronics",
      degree: "B.Tech",
      graduationYear: 2026,
      activeBacklogs: 1,
      skillNames: ["C++", "Java", "System Design"],
    },
    {
      email: "sneha.reddy@college.edu",
      fullName: "Sneha Reddy",
      cgpa: 8.1,
      branch: "Information Technology",
      degree: "B.Tech",
      graduationYear: 2027,
      activeBacklogs: 0,
      skillNames: ["TypeScript", "React", "Docker"],
    },
  ];

  const studentProfiles = [];
  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: await hash("Student@123"),
        role: Role.STUDENT,
        isEmailVerified: true,
      },
    });

    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        fullName: s.fullName,
        cgpa: s.cgpa,
        branch: s.branch,
        degree: s.degree,
        graduationYear: s.graduationYear,
        activeBacklogs: s.activeBacklogs,
        github: `https://github.com/${s.fullName.split(" ")[0].toLowerCase()}`,
        linkedin: `https://linkedin.com/in/${s.fullName.split(" ")[0].toLowerCase()}`,
      },
    });

    await Promise.all(
      s.skillNames.map((name) =>
        prisma.studentSkill.create({
          data: { studentId: profile.id, skillId: skillByName[name].id, proficiency: 3 },
        })
      )
    );

    studentProfiles.push(profile);
  }

  const drive1 = await prisma.drive.create({
    data: {
      companyId: company.id,
      title: "Software Development Engineer",
      jobDescription:
        "Build scalable backend services using Node.js, TypeScript and SQL. Familiarity with React is a plus.",
      packageLPA: 12,
      location: "Bangalore",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: DriveStatus.PUBLISHED,
      minCgpa: 7.5,
      allowedBranches: ["Computer Science", "Information Technology"],
      allowedDegrees: ["B.Tech"],
      maxBacklogs: 0,
    },
  });

  const drive2 = await prisma.drive.create({
    data: {
      companyId: company.id,
      title: "Data Analyst",
      jobDescription: "Work with SQL, Python and Machine Learning to derive business insights.",
      packageLPA: 9,
      location: "Remote",
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: DriveStatus.PUBLISHED,
      minCgpa: 7,
      allowedBranches: ["Computer Science", "Electronics", "Information Technology"],
      allowedDegrees: ["B.Tech"],
      maxBacklogs: 1,
    },
  });

  const application1 = await prisma.application.create({
    data: {
      studentId: studentProfiles[0].id,
      driveId: drive1.id,
      status: ApplicationStatus.SHORTLISTED,
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: application1.id,
      round: 1,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: "Google Meet",
    },
  });

  await prisma.application.create({
    data: {
      studentId: studentProfiles[1].id,
      driveId: drive2.id,
      status: ApplicationStatus.APPLIED,
    },
  });

  await prisma.notification.create({
    data: {
      userId: (await prisma.user.findUniqueOrThrow({ where: { id: studentProfiles[0].userId } })).id,
      type: NotificationType.SHORTLISTED,
      title: "You've been shortlisted!",
      message: `You have been shortlisted for ${drive1.title} at TechCorp Solutions.`,
    },
  });

  console.log("Seed data created:");
  console.log(`  Admin: admin@placement.edu / Admin@123`);
  console.log(`  Approved recruiter: recruiter@techcorp.com / Recruiter@123`);
  console.log(`  Pending recruiter: recruiter@financeplus.com / Recruiter@123`);
  console.log(`  Students: aarav.sharma@college.edu / Student@123 (and 3 more)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
