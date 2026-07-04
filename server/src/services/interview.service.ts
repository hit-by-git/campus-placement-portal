import { NotificationType, Role } from "@prisma/client";
import { z } from "zod";
import { applicationRepository } from "../repositories/application.repository";
import { interviewRepository } from "../repositories/interview.repository";
import { ApiError } from "../utils/ApiError";
import { assertRecruiterOwnsCompany } from "./companyAccess.util";
import { notificationService } from "./notification.service";
import { scheduleInterviewSchema, updateInterviewSchema } from "../validators/interview.validator";

type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;

const PROGRESSABLE_STATUSES = ["APPLIED", "SHORTLISTED"];

export const interviewService = {
  async schedule(userId: string, role: Role, input: ScheduleInterviewInput) {
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) throw ApiError.notFound("Application not found");
    await assertRecruiterOwnsCompany(userId, role, application.drive.companyId);

    if (["OFFERED", "REJECTED", "WITHDRAWN"].includes(application.status)) {
      throw ApiError.badRequest(`Cannot schedule an interview for an application in status ${application.status}`);
    }

    const { applicationId, ...rest } = input;
    const interview = await interviewRepository.create({
      ...rest,
      application: { connect: { id: applicationId } },
    });

    if (PROGRESSABLE_STATUSES.includes(application.status)) {
      await applicationRepository.updateStatus(applicationId, "INTERVIEW");
    }

    await notificationService.notify(
      interview.application.student.userId,
      NotificationType.INTERVIEW_SCHEDULED,
      `Interview scheduled: ${interview.application.drive.title}`,
      `Round ${interview.round} at ${interview.application.drive.company.name} is scheduled for ${interview.scheduledAt.toDateString()}.`
    );

    return interview;
  },

  async update(userId: string, role: Role, interviewId: string, input: UpdateInterviewInput) {
    const interview = await interviewRepository.findById(interviewId);
    if (!interview) throw ApiError.notFound("Interview not found");
    await assertRecruiterOwnsCompany(userId, role, interview.application.drive.companyId);

    return interviewRepository.update(interviewId, input);
  },
};
