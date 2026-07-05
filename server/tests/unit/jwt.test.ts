import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../src/utils/jwt";

describe("jwt utils", () => {
  it("round-trips an access token payload", () => {
    const token = signAccessToken({ sub: "user-1", role: "STUDENT" });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.role).toBe("STUDENT");
  });

  it("round-trips a refresh token payload", () => {
    const token = signRefreshToken({ sub: "user-2" });
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe("user-2");
  });

  it("rejects a tampered access token", () => {
    const token = signAccessToken({ sub: "user-3", role: "RECRUITER" });
    const tampered = `${token.slice(0, -1)}${token.slice(-1) === "a" ? "b" : "a"}`;
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it("rejects an access token verified with the wrong secret shape (malformed string)", () => {
    expect(() => verifyAccessToken("not-a-real-token")).toThrow();
  });

  it("does not accept a refresh token as an access token", () => {
    const refreshToken = signRefreshToken({ sub: "user-4" });
    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });
});
