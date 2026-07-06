import { useState, type FormEvent } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { studentsApi } from "../../api/students.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import type { StudentSkill } from "../../types";

export const SkillsManager = ({
  skills,
  onChange,
}: {
  skills: StudentSkill[];
  onChange: () => void;
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [proficiency, setProficiency] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await studentsApi.addSkill(name.trim(), proficiency);
      setName("");
      setProficiency(3);
      onChange();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (skillId: string) => {
    try {
      await studentsApi.removeSkill(skillId);
      onChange();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {skills.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet.</p>
        )}
        {skills.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          >
            {s.skill.name}
            <Badge tone="neutral">{s.proficiency}/5</Badge>
            <button
              type="button"
              onClick={() => handleRemove(s.skillId)}
              aria-label={`Remove ${s.skill.name}`}
              className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-100"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
        <input
          type="text"
          placeholder="e.g. React"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <select
          value={proficiency}
          onChange={(e) => setProficiency(Number(e.target.value))}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}/5
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" isLoading={isSubmitting}>
          Add skill
        </Button>
      </form>
    </div>
  );
};
