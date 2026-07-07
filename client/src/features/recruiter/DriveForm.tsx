import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";
import type { Drive } from "../../types";
import { driveFormSchema, type DriveFormValues } from "./schemas";

interface DriveFormProps {
  initial?: Drive;
  onSubmit: (values: DriveFormValues) => void;
  isSubmitting: boolean;
}

export const DriveForm = ({ initial, onSubmit, isSubmitting }: DriveFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DriveFormValues>({
    resolver: zodResolver(driveFormSchema),
    defaultValues: {
      title: initial?.title ?? "",
      jobDescription: initial?.jobDescription ?? "",
      packageLPA: initial?.packageLPA ?? 0,
      location: initial?.location ?? "",
      deadline: initial?.deadline?.slice(0, 10) ?? "",
      minCgpa: initial?.minCgpa ?? 0,
      allowedBranches: initial?.allowedBranches?.join(", ") ?? "",
      allowedDegrees: initial?.allowedDegrees?.join(", ") ?? "",
      maxBacklogs: initial?.maxBacklogs ?? 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label="Title" error={errors.title?.message} {...register("title")} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job description</label>
        <textarea
          rows={4}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          {...register("jobDescription")}
        />
        {errors.jobDescription && (
          <p className="text-xs text-rose-600 dark:text-rose-400">{errors.jobDescription.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Package (LPA)"
          type="number"
          step="0.1"
          error={errors.packageLPA?.message}
          {...register("packageLPA", { valueAsNumber: true })}
        />
        <TextField label="Location" error={errors.location?.message} {...register("location")} />
      </div>
      <TextField
        label="Application deadline"
        type="date"
        error={errors.deadline?.message}
        {...register("deadline")}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Minimum CGPA"
          type="number"
          step="0.01"
          error={errors.minCgpa?.message}
          {...register("minCgpa", { valueAsNumber: true })}
        />
        <TextField
          label="Max active backlogs"
          type="number"
          error={errors.maxBacklogs?.message}
          {...register("maxBacklogs", { valueAsNumber: true })}
        />
      </div>
      <TextField
        label="Allowed branches (comma-separated, blank = any)"
        placeholder="Computer Science, Information Technology"
        error={errors.allowedBranches?.message}
        {...register("allowedBranches")}
      />
      <TextField
        label="Allowed degrees (comma-separated, blank = any)"
        placeholder="B.Tech, M.Tech"
        error={errors.allowedDegrees?.message}
        {...register("allowedDegrees")}
      />
      <Button type="submit" isLoading={isSubmitting} className="self-start">
        {initial ? "Save changes" : "Create drive"}
      </Button>
    </form>
  );
};
