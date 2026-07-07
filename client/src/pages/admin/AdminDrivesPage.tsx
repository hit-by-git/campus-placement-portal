import { useEffect, useState } from "react";
import { Badge, StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { drivesApi } from "../../api/drives.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import type { Drive, DriveStatus, PaginationMeta } from "../../types";

export const AdminDrivesPage = () => {
  const { showToast } = useToast();
  const [drives, setDrives] = useState<Drive[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [status, setStatus] = useState<DriveStatus | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const { items, meta } = await drivesApi.list({ status: status || undefined, page, limit: 10 });
      setDrives(items);
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

  const handleClose = async (drive: Drive) => {
    try {
      const res = await drivesApi.update(drive.id, { status: "CLOSED" });
      showToast(res.message, "success");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async (drive: Drive) => {
    if (!confirm(`Delete drive "${drive.title}"?`)) return;
    try {
      await drivesApi.remove(drive.id);
      showToast("Drive deleted", "success");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["", "DRAFT", "PUBLISHED", "CLOSED"] as const).map((s) => (
          <button
            key={s || "ALL"}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              status === s
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : drives.length === 0 ? (
        <EmptyState title="No drives found" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {drives.map((d) => (
              <Card key={d.id} className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{d.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {d.company.name} · {d.packageLPA} LPA
                    </p>
                  </div>
                  <StatusBadge status={d.status} kind="drive" />
                </div>
                <Badge tone="neutral">Deadline {new Date(d.deadline).toLocaleDateString()}</Badge>
                <div className="flex gap-2">
                  {d.status === "PUBLISHED" && (
                    <Button type="button" variant="secondary" onClick={() => handleClose(d)}>
                      Close
                    </Button>
                  )}
                  <Button type="button" variant="danger" onClick={() => handleDelete(d)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};
