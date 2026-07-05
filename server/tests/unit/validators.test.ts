import { registerStudentSchema, loginSchema } from "../../src/validators/auth.validator";
import { createDriveSchema, updateDriveSchema } from "../../src/validators/drive.validator";
import { updateApplicationStatusSchema } from "../../src/validators/application.validator";

const validStudent = {
  email: "student@college.edu",
  password: "Passw0rd!",
  fullName: "Test Student",
  cgpa: 8.2,
  branch: "Computer Science",
  degree: "B.Tech",
  graduationYear: 2026,
};

describe("registerStudentSchema", () => {
  it("accepts a valid payload", () => {
    expect(registerStudentSchema.safeParse(validStudent).success).toBe(true);
  });

  it.each(["short1A", "alllowercase1", "ALLUPPERCASE1", "NoDigitsHere"])(
    "rejects a weak password: %s",
    (password) => {
      const result = registerStudentSchema.safeParse({ ...validStudent, password });
      expect(result.success).toBe(false);
    }
  );

  it("rejects an out-of-range CGPA", () => {
    const result = registerStudentSchema.safeParse({ ...validStudent, cgpa: 11 });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = registerStudentSchema.safeParse({ ...validStudent, email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("createDriveSchema", () => {
  const base = {
    companyId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    title: "SDE",
    jobDescription: "Build things with modern web technologies.",
    packageLPA: 10,
    location: "Remote",
    deadline: new Date(Date.now() + 86400000).toISOString(),
  };

  it("applies eligibility defaults when omitted", () => {
    const result = createDriveSchema.parse(base);
    expect(result.minCgpa).toBe(0);
    expect(result.allowedBranches).toEqual([]);
    expect(result.maxBacklogs).toBe(0);
  });

  it("rejects a non-positive package", () => {
    expect(createDriveSchema.safeParse({ ...base, packageLPA: 0 }).success).toBe(false);
  });

  it("rejects an invalid companyId", () => {
    expect(createDriveSchema.safeParse({ ...base, companyId: "not-a-uuid" }).success).toBe(false);
  });
});

describe("updateDriveSchema", () => {
  it("allows a partial update with just a status change", () => {
    expect(updateDriveSchema.safeParse({ status: "PUBLISHED" }).success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    expect(updateDriveSchema.safeParse({ status: "APPROVED" }).success).toBe(false);
  });
});

describe("updateApplicationStatusSchema", () => {
  it.each(["SHORTLISTED", "INTERVIEW", "REJECTED"])("accepts %s", (status) => {
    expect(updateApplicationStatusSchema.safeParse({ status }).success).toBe(true);
  });

  it.each(["OFFERED", "WITHDRAWN", "APPLIED"])(
    "rejects %s (only recruiter-settable transitions are allowed here)",
    (status) => {
      expect(updateApplicationStatusSchema.safeParse({ status }).success).toBe(false);
    }
  );
});
