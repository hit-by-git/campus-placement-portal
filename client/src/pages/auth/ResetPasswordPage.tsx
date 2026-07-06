import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "../../components/ui/AuthCard";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../api/axiosClient";
import { authApi } from "../../api/auth.api";
import { resetPasswordFormSchema, type ResetPasswordFormValues } from "../../features/auth/schemas";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordFormSchema) });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      showToast("Missing reset token", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authApi.resetPassword(token, values.password);
      showToast(res.message, "success");
      navigate("/login", { replace: true });
    } catch (err) {
      showToast(getErrorMessage(err, "Reset link is invalid or has expired"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Reset password"
      footer={
        <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
};
