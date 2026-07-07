import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FullPageSpinner } from "../../components/ui/Spinner";
import {
  analyticsApi,
  type AnalyticsOverview,
  type ApplicationsPerCompany,
  type SkillDistributionEntry,
} from "../../api/analytics.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";

export const AdminDashboardPage = () => {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [perCompany, setPerCompany] = useState<ApplicationsPerCompany[]>([]);
  const [skills, setSkills] = useState<SkillDistributionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<"students" | "placements" | null>(null);

  useEffect(() => {
    Promise.all([
      analyticsApi.overview(),
      analyticsApi.applicationsPerCompany(),
      analyticsApi.skillDistribution(),
    ])
      .then(([overviewData, perCompanyData, skillsData]) => {
        setOverview(overviewData);
        setPerCompany(perCompanyData);
        setSkills(skillsData);
      })
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async (type: "students" | "placements") => {
    setIsExporting(type);
    try {
      await (type === "students" ? analyticsApi.exportStudentsCsv() : analyticsApi.exportPlacementsCsv());
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsExporting(null);
    }
  };

  if (isLoading) return <FullPageSpinner />;
  if (!overview) return null;

  const maxApplications = Math.max(...perCompany.map((c) => c.applicationCount), 1);
  const maxSkillCount = Math.max(...skills.map((s) => s.studentCount), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{overview.totalStudents}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total Students</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{overview.placedStudents}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Placed</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {overview.placementPercentage}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Placement %</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {overview.averagePackageLPA.toFixed(1)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Avg Package (LPA)</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {overview.highestPackageLPA}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Highest Package (LPA)</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Applications per company</h2>
          {perCompany.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No applications yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {perCompany.map((c) => (
                <div key={c.companyId} className="text-sm">
                  <div className="mb-1 flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{c.companyName}</span>
                    <span>{c.applicationCount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${(c.applicationCount / maxApplications) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Student skill distribution</h2>
          {skills.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No skills recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {skills.slice(0, 10).map((s) => (
                <div key={s.skillName} className="text-sm">
                  <div className="mb-1 flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{s.skillName}</span>
                    <span>{s.studentCount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${(s.studentCount / maxSkillCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Export reports</h2>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            isLoading={isExporting === "students"}
            onClick={() => handleExport("students")}
          >
            Export students CSV
          </Button>
          <Button
            type="button"
            variant="secondary"
            isLoading={isExporting === "placements"}
            onClick={() => handleExport("placements")}
          >
            Export placements CSV
          </Button>
        </div>
      </Card>
    </div>
  );
};
