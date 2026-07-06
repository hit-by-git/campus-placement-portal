import { useEffect, useState } from "react";
import { drivesApi } from "../../api/drives.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { DriveCard } from "../../features/student/DriveCard";
import { useApplyToDrive } from "../../features/student/useApplyToDrive";
import type { Drive, DriveRecommendation, PaginationMeta } from "../../types";

type Tab = "all" | "eligible" | "recommended";

const TABS: { id: Tab; label: string }[] = [
  { id: "recommended", label: "Recommended for you" },
  { id: "eligible", label: "Eligible" },
  { id: "all", label: "All drives" },
];

export const DrivesPage = () => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("recommended");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [recommendations, setRecommendations] = useState<DriveRecommendation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const { apply, applyingId } = useApplyToDrive(() => load());

  const load = async () => {
    setIsLoading(true);
    try {
      if (tab === "recommended") {
        const data = await drivesApi.recommended(10);
        setRecommendations(data);
      } else if (tab === "eligible") {
        const { items, meta } = await drivesApi.listEligible({ page, limit: 9 });
        setDrives(items);
        setMeta(meta);
      } else {
        const { items, meta } = await drivesApi.list({ status: "PUBLISHED", page, limit: 9 });
        setDrives(items);
        setMeta(meta);
      }
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  const changeTab = (next: Tab) => {
    setTab(next);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => changeTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : tab === "recommended" ? (
        recommendations.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            subtitle="Add skills to your profile so we can match you with relevant drives."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((r) => (
              <DriveCard
                key={r.drive.id}
                drive={r.drive}
                score={r.score}
                matchedSkills={r.matchedSkills}
                onApply={apply}
                isApplying={applyingId === r.drive.id}
              />
            ))}
          </div>
        )
      ) : drives.length === 0 ? (
        <EmptyState title="No drives found" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drives.map((d) => (
              <DriveCard key={d.id} drive={d} onApply={apply} isApplying={applyingId === d.id} />
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};
