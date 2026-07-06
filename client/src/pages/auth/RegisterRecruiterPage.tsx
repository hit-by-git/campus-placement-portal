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
import {
  registerRecruiterFormSchema,
  type RegisterRecruiterFormValues,
} from "../../features/auth/schemas";

export const RegisterRecruiterPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRecruiterFormValues>({ resolver: zodResolver(registerRecruiterFormSchema) });

  const onSubmit = async (values: RegisterRecruiterFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await authApi.registerRecruiter({
        ...values,
        companyWebsite: values.companyWebsite || undefined,
      });
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
      title="Recruiter registration"
      subtitle="Your account will need Placement Officer approval before you can log in"
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
        <TextField
          label="Designation"
          placeholder="Talent Acquisition Partner"
          error={errors.designation?.message}
          {...register("designation")}
        />
        <TextField
          label="Company name"
          error={errors.companyName?.message}
          {...register("companyName")}
        />
        <TextField
          label="Company website (optional)"
          placeholder="https://example.com"
          error={errors.companyWebsite?.message}
          {...register("companyWebsite")}
        />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthCard>
  );
};
