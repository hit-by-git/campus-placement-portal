import { jaccardSimilarity, scoreDrive } from "../../src/services/recommendation.service";

describe("jaccardSimilarity", () => {
  it("returns 0.5 for an empty comparison set (neutral, not penalized)", () => {
    expect(jaccardSimilarity(new Set(["react"]), new Set())).toBe(0.5);
  });

  it("returns 1 for identical sets", () => {
    expect(jaccardSimilarity(new Set(["react", "node"]), new Set(["react", "node"]))).toBe(1);
  });

  it("returns 0 for disjoint non-empty sets", () => {
    expect(jaccardSimilarity(new Set(["react"]), new Set(["python"]))).toBe(0);
  });

  it("computes partial overlap correctly", () => {
    // intersection = {react} (1), union = {react, node, python} (3)
    expect(jaccardSimilarity(new Set(["react", "node"]), new Set(["react", "python"]))).toBeCloseTo(1 / 3);
  });
});

describe("scoreDrive", () => {
  it("scores a perfect skill/cgpa/package match near 1", () => {
    const score = scoreDrive(
      { cgpa: 10, skillNames: new Set(["react"]) },
      { minCgpa: 7, packageLPA: 10 },
      new Set(["react"]),
      10
    );
    expect(score).toBeGreaterThan(0.9);
  });

  it("rewards higher skill overlap over lower, all else equal", () => {
    const highOverlap = scoreDrive(
      { cgpa: 8, skillNames: new Set(["react", "node"]) },
      { minCgpa: 7, packageLPA: 10 },
      new Set(["react", "node"]),
      10
    );
    const lowOverlap = scoreDrive(
      { cgpa: 8, skillNames: new Set(["react", "node"]) },
      { minCgpa: 7, packageLPA: 10 },
      new Set(["python"]),
      10
    );
    expect(highOverlap).toBeGreaterThan(lowOverlap);
  });

  it("never scores above 1 even with a large CGPA margin", () => {
    const score = scoreDrive(
      { cgpa: 10, skillNames: new Set(["react"]) },
      { minCgpa: 0, packageLPA: 10 },
      new Set(["react"]),
      10
    );
    expect(score).toBeLessThanOrEqual(1);
  });

  it("treats a zero max package as neutral rather than dividing by zero", () => {
    const score = scoreDrive(
      { cgpa: 8, skillNames: new Set(["react"]) },
      { minCgpa: 7, packageLPA: 0 },
      new Set(["react"]),
      0
    );
    expect(Number.isFinite(score)).toBe(true);
  });
});
