import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { Drive } from "../../types";

interface DriveCardProps {
  drive: Drive;
  onApply: (driveId: string) => void;
  isApplying: boolean;
  score?: number;
  matchedSkills?: string[];
}

export const DriveCard = ({ drive, onApply, isApplying, score, matchedSkills }: DriveCardProps) => (
  <Card className="flex flex-col gap-3">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{drive.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{drive.company.name}</p>
      </div>
      {score !== undefined && (
        <Badge tone="info">Match {Math.round(score * 100)}%</Badge>
      )}
    </div>

    <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{drive.jobDescription}</p>

    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
      <Badge tone="neutral">{drive.packageLPA} LPA</Badge>
      <Badge tone="neutral">{drive.location}</Badge>
      <Badge tone="neutral">Min CGPA {drive.minCgpa}</Badge>
      <Badge tone="neutral">Deadline {new Date(drive.deadline).toLocaleDateString()}</Badge>
    </div>

    {matchedSkills && matchedSkills.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {matchedSkills.map((skill) => (
          <Badge key={skill} tone="success">
            {skill}
          </Badge>
        ))}
      </div>
    )}

    <Button
      type="button"
      className="mt-1 self-start"
      isLoading={isApplying}
      onClick={() => onApply(drive.id)}
    >
      Apply
    </Button>
  </Card>
);
