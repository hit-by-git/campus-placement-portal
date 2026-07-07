import { useEffect, useState } from "react";
import { axiosClient, getErrorMessage } from "../../api/axiosClient";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import type { ApiResponse, Company, PaginationMeta } from "../../types";

export const AdminCompaniesPage = () => {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get<ApiResponse<Company[]>>("/companies", {
        params: { search: search || undefined, page, limit: 10 },
      });
      setCompanies(res.data.data);
      setMeta(res.data.meta as PaginationMeta);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const handleDelete = async (company: Company) => {
    if (!confirm(`Delete "${company.name}"? This removes all of its drives too.`)) return;
    try {
      await axiosClient.delete(`/companies/${company.id}`);
      showToast("Company deleted", "success");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Companies</h1>
        <input
          type="text"
          placeholder="Search companies..."
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
      ) : companies.length === 0 ? (
        <EmptyState title="No companies found" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {companies.map((c) => (
              <Card key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {c.website}
                    </a>
                  )}
                </div>
                <Button type="button" variant="danger" onClick={() => handleDelete(c)}>
                  Delete
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
