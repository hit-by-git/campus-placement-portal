import { Badge, StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getFileUrl } from "../../utils/fileUrl";
import type { Application } from "../../types";

interface ApplicationCardProps {
  application: Application;
  onWithdraw: (id: string) => void;
  onRespondToOffer: (offerId: string, status: "ACCEPTED" | "DECLINED") => void;
  isBusy: boolean;
}

const WITHDRAWABLE = ["APPLIED", "SHORTLISTED", "INTERVIEW"];

export const ApplicationCard = ({
  application,
  onWithdraw,
  onRespondToOffer,
  isBusy,
}: ApplicationCardProps) => {
  const { drive, offer, interviews } = application;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{drive.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{drive.company.name}</p>
        </div>
        <StatusBadge status={application.status} kind="application" />
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Applied on {new Date(application.appliedAt).toLocaleDateString()}
      </p>

      {interviews.length > 0 && (
        <div className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
          <p className="mb-1 font-medium text-slate-700 dark:text-slate-300">Interviews</p>
          {interviews.map((iv) => (
            <div key={iv.id} className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>
                Round {iv.round} · {new Date(iv.scheduledAt).toLocaleString()} · {iv.mode}
              </span>
              <Badge tone="neutral">{iv.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {offer && (
        <div className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Offer: {offer.packageLPA} LPA
            </p>
            <Badge tone={offer.status === "ACCEPTED" ? "success" : offer.status === "DECLINED" ? "danger" : "warning"}>
              {offer.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {offer.offerLetterUrl && (
              <a
                href={getFileUrl(offer.offerLetterUrl) ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Download offer letter
              </a>
            )}
            {offer.status === "PENDING" && (
              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={isBusy}
                  onClick={() => onRespondToOffer(offer.id, "DECLINED")}
                >
                  Decline
                </Button>
                <Button type="button" isLoading={isBusy} onClick={() => onRespondToOffer(offer.id, "ACCEPTED")}>
                  Accept
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {WITHDRAWABLE.includes(application.status) && (
        <Button
          type="button"
          variant="danger"
          className="self-start"
          isLoading={isBusy}
          onClick={() => onWithdraw(application.id)}
        >
          Withdraw application
        </Button>
      )}
    </Card>
  );
};
