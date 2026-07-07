import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { companiesApi } from "../../api/companies.api";
import { drivesApi } from "../../api/drives.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import { DriveForm } from "../../features/recruiter/DriveForm";
import type { DriveFormValues } from "../../features/recruiter/schemas";
import type { Drive, DriveStatus, PaginationMeta } from "../../types";

const toArray = (csv?: string) =>
  csv
    ? csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

export const RecruiterDrivesPage = () => {
  const { showToast } = useToast();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [statusFilter, setStatusFilter] = useState<DriveStatus | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"closed" | "create" | Drive>("closed");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async (id: string) => {
    setIsLoading(true);
    try {
      const { items, meta } = await drivesApi.list({
        companyId: id,
        status: statusFilter || undefined,
        page,
        limit: 8,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setDrives(items);
      setMeta(meta);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    companiesApi
      .getMyCompany()
      .then((c) => {
        setCompanyId(c.id);
        return load(c.id);
      })
      .catch((err) => {
        showToast(getErrorMessage(err), "error");
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const handleCreate = async (values: DriveFormValues) => {
    if (!companyId) return;
    setIsSubmitting(true);
    try {
      const res = await drivesApi.create({
        companyId,
        title: values.title,
        jobDescription: values.jobDescription,
        packageLPA: values.packageLPA,
        location: values.location,
        deadline: new Date(values.deadline).toISOString(),
        minCgpa: values.minCgpa,
        allowedBranches: toArray(values.allowedBranches),
        allowedDegrees: toArray(values.allowedDegrees),
        maxBacklogs: values.maxBacklogs,
      });
      showToast(res.message, "success");
      setModalMode("closed");
      load(companyId);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (drive: Drive, values: DriveFormValues) => {
    if (!companyId) return;
    setIsSubmitting(true);
    try {
      const res = await drivesApi.update(drive.id, {
        title: values.title,
        jobDescription: values.jobDescription,
        packageLPA: values.packageLPA,
        location: values.location,
        deadline: new Date(values.deadline).toISOString(),
        minCgpa: values.minCgpa,
        allowedBranches: toArray(values.allowedBranches),
        allowedDegrees: toArray(values.allowedDegrees),
        maxBacklogs: values.maxBacklogs,
      });
      showToast(res.message, "success");
      setModalMode("closed");
      load(companyId);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeStatus = async (drive: Drive, status: DriveStatus) => {
    if (!companyId) return;
    try {
      const res = await drivesApi.update(drive.id, { status });
      showToast(res.message, "success");
      load(companyId);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async (drive: Drive) => {
    if (!companyId) return;
    if (!confirm(`Delete drive "${drive.title}"? This cannot be undone.`)) return;
    try {
      await drivesApi.remove(drive.id);
      showToast("Drive deleted", "success");
      load(companyId);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  if (isLoading && drives.length === 0 && !meta) return <FullPageSpinner />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {(["", "DRAFT", "PUBLISHED", "CLOSED"] as const).map((s) => (
            <button
              key={s || "ALL"}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
        <Button type="button" onClick={() => setModalMode("create")}>
          New drive
        </Button>
      </div>

      {drives.length === 0 ? (
        <EmptyState title="No drives yet" subtitle="Create your first drive to start receiving applications." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {drives.map((drive) => (
              <Card key={drive.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{drive.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {drive.packageLPA} LPA · {drive.location}
                    </p>
                  </div>
                  <StatusBadge status={drive.status} kind="drive" />
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge tone="neutral">Min CGPA {drive.minCgpa}</Badge>
                  <Badge tone="neutral">Deadline {new Date(drive.deadline).toLocaleDateString()}</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/recruiter/drives/${drive.id}/applicants`}
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    View applicants
                  </Link>
                  <div className="ml-auto flex gap-2">
                    {drive.status === "DRAFT" && (
                      <Button type="button" variant="secondary" onClick={() => changeStatus(drive, "PUBLISHED")}>
                        Publish
                      </Button>
                    )}
                    {drive.status === "PUBLISHED" && (
                      <Button type="button" variant="secondary" onClick={() => changeStatus(drive, "CLOSED")}>
                        Close
                      </Button>
                    )}
                    <Button type="button" variant="secondary" onClick={() => setModalMode(drive)}>
                      Edit
                    </Button>
                    <Button type="button" variant="danger" onClick={() => handleDelete(drive)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}

      <Modal title="Create drive" isOpen={modalMode === "create"} onClose={() => setModalMode("closed")}>
        <DriveForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
      </Modal>

      <Modal
        title="Edit drive"
        isOpen={modalMode !== "closed" && modalMode !== "create"}
        onClose={() => setModalMode("closed")}
      >
        {modalMode !== "closed" && modalMode !== "create" && (
          <DriveForm
            initial={modalMode}
            onSubmit={(values) => handleUpdate(modalMode, values)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};
