import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  info: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

export const Badge = ({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_STYLES[tone]}`}
  >
    {children}
  </span>
);

const APPLICATION_STATUS_TONE: Record<string, BadgeTone> = {
  APPLIED: "info",
  SHORTLISTED: "warning",
  INTERVIEW: "warning",
  OFFERED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
};

const DRIVE_STATUS_TONE: Record<string, BadgeTone> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  CLOSED: "danger",
};

const OFFER_STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
};

export const StatusBadge = ({
  status,
  kind,
}: {
  status: string;
  kind: "application" | "drive" | "offer";
}) => {
  const toneMap =
    kind === "application"
      ? APPLICATION_STATUS_TONE
      : kind === "drive"
        ? DRIVE_STATUS_TONE
        : OFFER_STATUS_TONE;

  return <Badge tone={toneMap[status] ?? "neutral"}>{status.replace(/_/g, " ")}</Badge>;
};
