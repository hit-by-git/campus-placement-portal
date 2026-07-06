import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "../../components/ui/AuthCard";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../api/axiosClient";
import { authApi } from "../../api/auth.api";
import { registerStudentFormSchema, type RegisterStudentFormValues } from "../../features/auth/schemas";

export const RegisterStudentPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStudentFormValues>({ resolver: zodResolver(registerStudentFormSchema) });

  const onSubmit = async (values: RegisterStudentFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await authApi.registerStudent(values);
      showToast(res.message, "success");
      navigate("/login", { replace: true });
    } catch (err) {
      showToast(getErrorMessage(err, "Registration failed"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Student registration"
      subtitle="Create your student account"
      footer={
        <span className="text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Log in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <TextField label="Full name" error={errors.fullName?.message} {...register("fullName")} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Branch"
            placeholder="Computer Science"
            error={errors.branch?.message}
            {...register("branch")}
          />
          <TextField
            label="Degree"
            placeholder="B.Tech"
            error={errors.degree?.message}
            {...register("degree")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="CGPA"
            type="number"
            step="0.01"
            min={0}
            max={10}
            error={errors.cgpa?.message}
            {...register("cgpa", { valueAsNumber: true })}
          />
          <TextField
            label="Graduation year"
            type="number"
            error={errors.graduationYear?.message}
            {...register("graduationYear", { valueAsNumber: true })}
          />
        </div>
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthCard>
  );
};
