import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { authService } from "../services/auth.service";
import { isProduction } from "../config/env";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/v1/auth";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
};

export const authController = {
  registerStudent: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.registerStudent(req.body);
    res
      .status(201)
      .json(new ApiResponse(user, "Registration successful. Please verify your email."));
  }),

  registerRecruiter: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.registerRecruiter(req.body);
    res
      .status(201)
      .json(
        new ApiResponse(
          user,
          "Registration successful. Please verify your email; your account also needs Placement Officer approval before you can log in."
        )
      );
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    await authService.verifyEmail(req.body.token);
    res.json(new ApiResponse(null, "Email verified successfully"));
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await authService.login(
      req.body.email,
      req.body.password
    );
    setRefreshCookie(res, refreshToken);
    res.json(new ApiResponse({ accessToken, user }, "Login successful"));
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) throw ApiError.unauthorized("No refresh token provided");

    const { accessToken, refreshToken, user } = await authService.refresh(token);
    setRefreshCookie(res, refreshToken);
    res.json(new ApiResponse({ accessToken, user }, "Token refreshed"));
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    if (req.user) await authService.logout(req.user.id);
    clearRefreshCookie(res);
    res.json(new ApiResponse(null, "Logged out"));
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    res.json(
      new ApiResponse(null, "If an account exists for this email, a reset link has been sent.")
    );
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json(new ApiResponse(null, "Password reset successfully. Please log in."));
  }),
};
