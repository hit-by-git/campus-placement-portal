import { useRef, useState } from "react";
import { Button } from "../../components/ui/Button";
import { studentsApi } from "../../api/students.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import { getFileUrl } from "../../utils/fileUrl";
import type { Resume } from "../../types";

export const ResumeManager = ({
  resumeUrl,
  latestResume,
  onUploaded,
}: {
  resumeUrl: string | null;
  latestResume: Resume | null;
  onUploaded: () => void;
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { matchedSkillNames } = await studentsApi.uploadResume(file);
      showToast(
        matchedSkillNames.length > 0
          ? `Resume uploaded. Matched skills: ${matchedSkillNames.join(", ")}`
          : "Resume uploaded and parsed",
        "success"
      );
      onUploaded();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" isLoading={isUploading} onClick={() => fileInputRef.current?.click()}>
          Upload resume (PDF)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        {resumeUrl && (
          <a
            href={getFileUrl(resumeUrl) ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View current resume
          </a>
        )}
      </div>

      {latestResume && (
        <div className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
          <p className="font-medium text-slate-700 dark:text-slate-300">Parsed from your resume</p>
          {latestResume.parsedName && (
            <p className="mt-1 text-slate-500 dark:text-slate-400">Name: {latestResume.parsedName}</p>
          )}
          {latestResume.parsedEducation && (
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Education: {latestResume.parsedEducation}
            </p>
          )}
          {latestResume.parsedProjects && (
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Projects: {latestResume.parsedProjects}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
