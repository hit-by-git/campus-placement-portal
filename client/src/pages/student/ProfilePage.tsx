import { useCallback, useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { studentsApi } from "../../api/students.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import { ProfileForm } from "../../features/student/ProfileForm";
import { SkillsManager } from "../../features/student/SkillsManager";
import { CertificatesManager } from "../../features/student/CertificatesManager";
import { ResumeManager } from "../../features/student/ResumeManager";
import type { Resume, StudentProfile } from "../../types";

export const ProfilePage = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [latestResume, setLatestResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await studentsApi.getMe();
      setProfile(data);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  }, [showToast]);

  const refreshResume = useCallback(async () => {
    try {
      const resume = await studentsApi.getLatestResume();
      setLatestResume(resume);
    } catch {
      setLatestResume(null);
    }
  }, []);

  useEffect(() => {
    Promise.all([refresh(), refreshResume()]).finally(() => setIsLoading(false));
  }, [refresh, refreshResume]);

  if (isLoading) return <FullPageSpinner />;
  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Personal details
        </h2>
        <ProfileForm profile={profile} onSaved={setProfile} />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Skills</h2>
        <SkillsManager skills={profile.skills} onChange={refresh} />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Certificates</h2>
        <CertificatesManager certificates={profile.certificates} onChange={refresh} />
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Resume</h2>
        <ResumeManager
          resumeUrl={profile.resumeUrl}
          latestResume={latestResume}
          onUploaded={() => {
            refresh();
            refreshResume();
          }}
        />
      </Card>
    </div>
  );
};
