import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { TextField } from "../../components/ui/TextField";
import { getFileUrl } from "../../utils/fileUrl";
import { offersApi } from "../../api/offers.api";
import { interviewsApi } from "../../api/interviews.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import type { Application } from "../../types";
import {
  makeOfferFormSchema,
  scheduleInterviewFormSchema,
  type MakeOfferFormValues,
  type ScheduleInterviewFormValues,
} from "./schemas";

const OFFERABLE = ["SHORTLISTED", "INTERVIEW"];

interface ApplicantCardProps {
  application: Application;
  onUpdateStatus: (id: string, status: "SHORTLISTED" | "INTERVIEW" | "REJECTED") => void;
  onRefresh: () => void;
  isBusy: boolean;
}

export const ApplicantCard = ({ application, onUpdateStatus, onRefresh, isBusy }: ApplicantCardProps) => {
  const { showToast } = useToast();
  const { student, interviews, offer } = application;
  const [modal, setModal] = useState<"none" | "interview" | "offer">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const offerLetterInputRef = useRef<HTMLInputElement>(null);

  const interviewForm = useForm<ScheduleInterviewFormValues>({
    resolver: zodResolver(scheduleInterviewFormSchema),
    defaultValues: { round: interviews.length + 1, mode: "ONLINE", scheduledAt: "", location: "" },
  });

  const offerForm = useForm<MakeOfferFormValues>({
    resolver: zodResolver(makeOfferFormSchema),
    defaultValues: { packageLPA: application.drive.packageLPA },
  });

  const scheduleInterview = async (values: ScheduleInterviewFormValues) => {
    setIsSubmitting(true);
    try {
      await interviewsApi.schedule({
        applicationId: application.id,
        round: values.round,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        mode: values.mode,
        location: values.location || undefined,
      });
      showToast("Interview scheduled", "success");
      setModal("none");
      onRefresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const makeOffer = async (values: MakeOfferFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await offersApi.create(application.id, values.packageLPA);
      showToast(res.message, "success");
      setModal("none");
      onRefresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfferLetterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !offer) return;
    try {
      const res = await offersApi.uploadOfferLetter(offer.id, file);
      showToast(res.message, "success");
      onRefresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      if (offerLetterInputRef.current) offerLetterInputRef.current.value = "";
    }
  };

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{student.fullName}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {student.user.email} · {student.branch} · CGPA {student.cgpa}
          </p>
        </div>
        <StatusBadge status={application.status} kind="application" />
      </div>

      {student.resumeUrl && (
        <a
          href={getFileUrl(student.resumeUrl) ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          View resume
        </a>
      )}

      {interviews.length > 0 && (
        <div className="rounded-md border border-slate-200 p-2 text-xs dark:border-slate-800">
          {interviews.map((iv) => (
            <div key={iv.id} className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>
                Round {iv.round} · {new Date(iv.scheduledAt).toLocaleString()}
              </span>
              <Badge tone="neutral">{iv.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {offer && (
        <div className="rounded-md border border-slate-200 p-2 text-xs dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span>Offer: {offer.packageLPA} LPA</span>
            <Badge tone={offer.status === "ACCEPTED" ? "success" : offer.status === "DECLINED" ? "danger" : "warning"}>
              {offer.status}
            </Badge>
          </div>
          {!offer.offerLetterUrl && (
            <div className="mt-2">
              <input ref={offerLetterInputRef} type="file" accept="application/pdf" onChange={handleOfferLetterUpload} />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {application.status === "APPLIED" && (
          <>
            <Button type="button" isLoading={isBusy} onClick={() => onUpdateStatus(application.id, "SHORTLISTED")}>
              Shortlist
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isBusy}
              onClick={() => onUpdateStatus(application.id, "REJECTED")}
            >
              Reject
            </Button>
          </>
        )}
        {["SHORTLISTED", "INTERVIEW"].includes(application.status) && (
          <>
            <Button type="button" variant="secondary" onClick={() => setModal("interview")}>
              Schedule interview
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isBusy}
              onClick={() => onUpdateStatus(application.id, "REJECTED")}
            >
              Reject
            </Button>
          </>
        )}
        {OFFERABLE.includes(application.status) && !offer && (
          <Button type="button" onClick={() => setModal("offer")}>
            Make offer
          </Button>
        )}
      </div>

      <Modal title="Schedule interview" isOpen={modal === "interview"} onClose={() => setModal("none")}>
        <form onSubmit={interviewForm.handleSubmit(scheduleInterview)} className="flex flex-col gap-3" noValidate>
          <TextField
            label="Round"
            type="number"
            error={interviewForm.formState.errors.round?.message}
            {...interviewForm.register("round", { valueAsNumber: true })}
          />
          <TextField
            label="Date & time"
            type="datetime-local"
            error={interviewForm.formState.errors.scheduledAt?.message}
            {...interviewForm.register("scheduledAt")}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mode</label>
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...interviewForm.register("mode")}
            >
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">In person</option>
            </select>
          </div>
          <TextField
            label="Location / link"
            error={interviewForm.formState.errors.location?.message}
            {...interviewForm.register("location")}
          />
          <Button type="submit" isLoading={isSubmitting} className="self-start">
            Schedule
          </Button>
        </form>
      </Modal>

      <Modal title="Make offer" isOpen={modal === "offer"} onClose={() => setModal("none")}>
        <form onSubmit={offerForm.handleSubmit(makeOffer)} className="flex flex-col gap-3" noValidate>
          <TextField
            label="Package (LPA)"
            type="number"
            step="0.1"
            error={offerForm.formState.errors.packageLPA?.message}
            {...offerForm.register("packageLPA", { valueAsNumber: true })}
          />
          <Button type="submit" isLoading={isSubmitting} className="self-start">
            Send offer
          </Button>
        </form>
      </Modal>
    </Card>
  );
};
