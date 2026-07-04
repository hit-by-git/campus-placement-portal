import { parseSort } from "../../src/utils/sorting";

const ALLOWED = ["createdAt", "name"] as const;

describe("parseSort", () => {
  it("falls back to the default field when sortBy is not provided", () => {
    expect(parseSort(undefined, undefined, ALLOWED, "createdAt")).toEqual({ createdAt: "desc" });
  });

  it("falls back to the default field when sortBy is not in the allow-list", () => {
    expect(parseSort("password", "asc", ALLOWED, "createdAt")).toEqual({ createdAt: "asc" });
  });

  it("uses the requested field when it is allowed", () => {
    expect(parseSort("name", "asc", ALLOWED, "createdAt")).toEqual({ name: "asc" });
  });

  it("defaults sortOrder to desc for anything other than asc", () => {
    expect(parseSort("name", "sideways", ALLOWED, "createdAt")).toEqual({ name: "desc" });
  });
});
