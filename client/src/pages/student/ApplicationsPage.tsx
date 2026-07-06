import { useEffect, useState } from "react";
import { applicationsApi } from "../../api/applications.api";
import { offersApi } from "../../api/offers.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { ApplicationCard } from "../../features/student/ApplicationCard";
import type { Application, ApplicationStatus, PaginationMeta } from "../../types";

const STATUS_FILTERS: { label: string; value: ApplicationStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Applied", value: "APPLIED" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Offered", value: "OFFERED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
];

export const ApplicationsPage = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const { items, meta } = await applicationsApi.listMine({
        page,
        limit: 9,
        status: status || undefined,
      });
      setApplications(items);
      setMeta(meta);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const handleWithdraw = async (id: string) => {
    setBusyId(id);
    try {
      const res = await applicationsApi.withdraw(id);
      showToast(res.message, "success");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleRespondToOffer = async (offerId: string, respondStatus: "ACCEPTED" | "DECLINED") => {
    setBusyId(offerId);
    try {
      const res = await offersApi.respond(offerId, respondStatus);
      showToast(res.message, "success");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              status === f.value
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : applications.length === 0 ? (
        <EmptyState title="No applications found" subtitle="Browse drives and apply to get started." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onWithdraw={handleWithdraw}
                onRespondToOffer={handleRespondToOffer}
                isBusy={busyId === app.id || busyId === app.offer?.id}
              />
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};
