import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";
import { studentsApi } from "../../api/students.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import type { StudentProfile } from "../../types";
import { profileFormSchema, type ProfileFormValues } from "./schemas";

export const ProfileForm = ({
  profile,
  onSaved,
}: {
  profile: StudentProfile;
  onSaved: (profile: StudentProfile) => void;
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone ?? "",
      cgpa: profile.cgpa,
      branch: profile.branch,
      degree: profile.degree,
      graduationYear: profile.graduationYear,
      activeBacklogs: profile.activeBacklogs,
      gender: profile.gender ?? "",
      github: profile.github ?? "",
      linkedin: profile.linkedin ?? "",
      bio: profile.bio ?? "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const updated = await studentsApi.updateMe({
        ...values,
        phone: values.phone || undefined,
        github: values.github || undefined,
        linkedin: values.linkedin || undefined,
        gender: values.gender || undefined,
      });
      onSaved(updated);
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Full name" error={errors.fullName?.message} {...register("fullName")} />
        <TextField label="Phone" error={errors.phone?.message} {...register("phone")} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Branch" error={errors.branch?.message} {...register("branch")} />
        <TextField label="Degree" error={errors.degree?.message} {...register("degree")} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField
          label="CGPA"
          type="number"
          step="0.01"
          error={errors.cgpa?.message}
          {...register("cgpa", { valueAsNumber: true })}
        />
        <TextField
          label="Graduation year"
          type="number"
          error={errors.graduationYear?.message}
          {...register("graduationYear", { valueAsNumber: true })}
        />
        <TextField
          label="Active backlogs"
          type="number"
          error={errors.activeBacklogs?.message}
          {...register("activeBacklogs", { valueAsNumber: true })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          {...register("gender")}
        >
          <option value="">Prefer not to say</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="GitHub URL" error={errors.github?.message} {...register("github")} />
        <TextField label="LinkedIn URL" error={errors.linkedin?.message} {...register("linkedin")} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
        <textarea
          rows={3}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          {...register("bio")}
        />
      </div>
      <Button type="submit" isLoading={isSubmitting} className="self-start">
        Save profile
      </Button>
    </form>
  );
};
