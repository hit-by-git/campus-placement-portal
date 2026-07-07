import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { applicationsApi } from "../../api/applications.api";
import { drivesApi } from "../../api/drives.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import { ApplicantCard } from "../../features/recruiter/ApplicantCard";
import type { Application, ApplicationStatus, Drive, PaginationMeta } from "../../types";

const STATUS_FILTERS: { label: string; value: ApplicationStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Applied", value: "APPLIED" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Offered", value: "OFFERED" },
  { label: "Rejected", value: "REJECTED" },
];

export const ApplicantsPage = () => {
  const { driveId } = useParams<{ driveId: string }>();
  const { showToast } = useToast();
  const [drive, setDrive] = useState<Drive | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!driveId) return;
    setIsLoading(true);
    try {
      const { items, meta } = await applicationsApi.listForDrive(driveId, {
        status: status || undefined,
        page,
        limit: 8,
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
    if (driveId) drivesApi.getById(driveId).then(setDrive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveId, status, page]);

  const handleUpdateStatus = async (id: string, newStatus: "SHORTLISTED" | "INTERVIEW" | "REJECTED") => {
    setBusyId(id);
    try {
      const res = await applicationsApi.updateStatus(id, newStatus);
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
      <Link to="/recruiter/drives" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
        ← Back to drives
      </Link>
      {drive && (
        <h1 className="mt-2 mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Applicants: {drive.title}
        </h1>
      )}

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
        <EmptyState title="No applicants found" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {applications.map((app) => (
              <ApplicantCard
                key={app.id}
                application={app}
                onUpdateStatus={handleUpdateStatus}
                onRefresh={load}
                isBusy={busyId === app.id}
              />
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};
