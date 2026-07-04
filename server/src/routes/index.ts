import { Router } from "express";
import { authRouter } from "./auth.routes";
import { studentRouter } from "./student.routes";
import { companyRouter } from "./company.routes";
import { driveRouter } from "./drive.routes";
import { applicationRouter } from "./application.routes";
import { interviewRouter } from "./interview.routes";
import { offerRouter } from "./offer.routes";
import { notificationRouter } from "./notification.routes";
import { adminRouter } from "./admin.routes";
import { analyticsRouter } from "./analytics.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/students", studentRouter);
apiRouter.use("/companies", companyRouter);
apiRouter.use("/drives", driveRouter);
apiRouter.use("/applications", applicationRouter);
apiRouter.use("/interviews", interviewRouter);
apiRouter.use("/offers", offerRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/analytics", analyticsRouter);

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
