import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { studentsApi } from "../../api/students.api";
import { applicationsApi } from "../../api/applications.api";
import { notificationsApi } from "../../api/notifications.api";
import type { Application, Notification, StudentProfile } from "../../types";

const STATUS_ORDER: Application["status"][] = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
];

export const StudentDashboardPage = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentsApi.getMe(),
      applicationsApi.listMine({ limit: 100 }),
      notificationsApi.listMine({ limit: 5 }),
    ])
      .then(([profileData, applicationsData, notificationsData]) => {
        setProfile(profileData);
        setApplications(applicationsData.items);
        setNotifications(notificationsData.items);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <FullPageSpinner />;
  if (!profile) return null;

  const counts = STATUS_ORDER.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Welcome, {profile.fullName}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {profile.branch} · {profile.degree} · CGPA {profile.cgpa}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {counts.map(({ status, count }) => (
          <Card key={status} className="text-center">
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{count}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{status}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Quick links</h2>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/student/drives" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Browse eligible & recommended drives
            </Link>
            <Link to="/student/applications" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Track your applications
            </Link>
            <Link to="/student/profile" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Update your profile & resume
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Recent notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {notifications.map((n) => (
                <li key={n.id} className="border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                  <p className="text-slate-500 dark:text-slate-400">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
