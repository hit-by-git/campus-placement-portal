import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { requireAuth } from "../middlewares/auth";
import { authRateLimiter } from "../middlewares/rateLimiter";
import {
  forgotPasswordSchema,
  loginSchema,
  registerRecruiterSchema,
  registerStudentSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validator";

export const authRouter = Router();

authRouter.use(authRateLimiter);

/**
 * @openapi
 * /auth/register/student:
 *   post:
 *     summary: Register a new student account
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Registration successful
 */
authRouter.post(
  "/register/student",
  validate({ body: registerStudentSchema }),
  authController.registerStudent
);

/**
 * @openapi
 * /auth/register/recruiter:
 *   post:
 *     summary: Register a new recruiter account (requires admin approval)
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Registration successful
 */
authRouter.post(
  "/register/recruiter",
  validate({ body: registerRecruiterSchema }),
  authController.registerRecruiter
);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Verify a user's email using the token sent via email
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Email verified
 */
authRouter.post(
  "/verify-email",
  validate({ body: verifyEmailSchema }),
  authController.verifyEmail
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive an access token (refresh token set as httpOnly cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 */
authRouter.post("/login", validate({ body: loginSchema }), authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rotate the refresh token and issue a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed
 */
authRouter.post("/refresh", authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out and revoke the refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
authRouter.post("/logout", requireAuth, authController.logout);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Reset link sent if the account exists
 */
authRouter.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a reset token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
authRouter.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  authController.resetPassword
);
