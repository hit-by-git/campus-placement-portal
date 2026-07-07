import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { companiesApi } from "../../api/companies.api";
import { drivesApi } from "../../api/drives.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import type { Company, Drive, DriveStatus } from "../../types";

const STATUS_ORDER: DriveStatus[] = ["DRAFT", "PUBLISHED", "CLOSED"];

export const RecruiterDashboardPage = () => {
  const { showToast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    companiesApi
      .getMyCompany()
      .then((c) => {
        setCompany(c);
        return drivesApi.list({ companyId: c.id, limit: 100 });
      })
      .then((res) => res && setDrives(res.items))
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <FullPageSpinner />;
  if (!company) return null;

  const counts = STATUS_ORDER.map((status) => ({
    status,
    count: drives.filter((d) => d.status === status).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{company.name}</h1>
        <p className="text-slate-500 dark:text-slate-400">{company.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:max-w-md">
        {counts.map(({ status, count }) => (
          <Card key={status} className="text-center">
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{count}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{status}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Quick links</h2>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/recruiter/company" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Edit company details
          </Link>
          <Link to="/recruiter/drives" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Manage drives and applicants
          </Link>
        </div>
      </Card>
    </div>
  );
};
