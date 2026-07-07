import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { getFileUrl } from "../../utils/fileUrl";
import { studentsApi } from "../../api/students.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import type { PaginationMeta, StudentProfile } from "../../types";

export const StudentsPage = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      studentsApi
        .listAll({ search: search || undefined, page, limit: 10, sortBy: "fullName", sortOrder: "asc" })
        .then(({ items, meta }) => {
          setStudents(items);
          setMeta(meta);
        })
        .catch((err) => showToast(getErrorMessage(err), "error"))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Students</h1>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : students.length === 0 ? (
        <EmptyState title="No students found" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {students.map((s) => (
              <Card key={s.id} className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{s.fullName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{s.user.email}</p>
                  </div>
                  <Badge tone="neutral">CGPA {s.cgpa}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Badge tone="neutral">{s.branch}</Badge>
                  <Badge tone="neutral">{s.degree}</Badge>
                  <Badge tone="neutral">Class of {s.graduationYear}</Badge>
                  {s.activeBacklogs > 0 && <Badge tone="warning">{s.activeBacklogs} backlogs</Badge>}
                </div>
                {s.resumeUrl && (
                  <a
                    href={getFileUrl(s.resumeUrl) ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    View resume
                  </a>
                )}
              </Card>
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
};
