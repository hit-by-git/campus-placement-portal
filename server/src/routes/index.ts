import { Router } from "express";
import { authRouter } from "./auth.routes";
import { studentRouter } from "./student.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/students", studentRouter);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 */
apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK", data: { uptime: process.uptime() } });
});
