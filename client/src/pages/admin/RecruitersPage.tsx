import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { adminApi, type PendingRecruiter } from "../../api/admin.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import type { PaginationMeta } from "../../types";

export const RecruitersPage = () => {
  const { showToast } = useToast();
  const [recruiters, setRecruiters] = useState<PendingRecruiter[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const { items, meta } = await adminApi.listPendingRecruiters({ page, limit: 10 });
      setRecruiters(items);
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
  }, [page]);

  const handleApprove = async (userId: string) => {
    setBusyId(userId);
    try {
      const res = await adminApi.approveRecruiter(userId);
      showToast(res.message, "success");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <FullPageSpinner />;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Recruiters pending approval
      </h1>

      {recruiters.length === 0 ? (
        <EmptyState title="No pending recruiters" subtitle="All recruiter accounts are approved." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {recruiters.map((r) => (
              <Card key={r.user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{r.user.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {r.company?.name ?? "No company"} · {r.designation ?? "—"}
                  </p>
                </div>
                <Button
                  type="button"
                  isLoading={busyId === r.user.id}
                  onClick={() => handleApprove(r.user.id)}
                >
                  Approve
                </Button>
              </Card>
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};
