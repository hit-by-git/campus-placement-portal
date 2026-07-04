import { evaluateEligibility } from "../../src/services/eligibility.service";

const baseStudent = {
  cgpa: 8,
  branch: "Computer Science",
  degree: "B.Tech",
  graduationYear: 2026,
  activeBacklogs: 0,
  gender: "FEMALE" as const,
};

const baseDrive = {
  minCgpa: 7,
  allowedBranches: ["Computer Science"],
  allowedDegrees: ["B.Tech"],
  maxGraduationYear: 2026,
  maxBacklogs: 0,
  genderRule: null,
};

describe("evaluateEligibility", () => {
  it("marks a fully matching student as eligible with no reasons", () => {
    const result = evaluateEligibility(baseStudent, baseDrive);
    expect(result).toEqual({ eligible: true, reasons: [] });
  });

  it("flags insufficient CGPA", () => {
    const result = evaluateEligibility({ ...baseStudent, cgpa: 6.5 }, baseDrive);
    expect(result.eligible).toBe(false);
    expect(result.reasons[0]).toMatch(/CGPA/);
  });

  it("flags a disallowed branch", () => {
    const result = evaluateEligibility({ ...baseStudent, branch: "Mechanical" }, baseDrive);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("Branch"))).toBe(true);
  });

  it("allows any branch when allowedBranches is empty", () => {
    const result = evaluateEligibility(
      { ...baseStudent, branch: "Mechanical" },
      { ...baseDrive, allowedBranches: [] }
    );
    expect(result.eligible).toBe(true);
  });

  it("flags graduation year after the cutoff", () => {
    const result = evaluateEligibility({ ...baseStudent, graduationYear: 2028 }, baseDrive);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("Graduation year"))).toBe(true);
  });

  it("flags backlogs above the allowed maximum", () => {
    const result = evaluateEligibility({ ...baseStudent, activeBacklogs: 1 }, baseDrive);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("backlogs"))).toBe(true);
  });

  it("enforces a gender rule when configured", () => {
    const result = evaluateEligibility(baseStudent, { ...baseDrive, genderRule: "MALE" });
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("Gender"))).toBe(true);
  });

  it("accumulates multiple failure reasons at once", () => {
    const result = evaluateEligibility(
      { ...baseStudent, cgpa: 5, branch: "Mechanical", activeBacklogs: 2 },
      baseDrive
    );
    expect(result.eligible).toBe(false);
    expect(result.reasons.length).toBe(3);
  });
});
