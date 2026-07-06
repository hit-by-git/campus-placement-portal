import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "../../components/ui/AuthCard";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../api/axiosClient";
import { authApi } from "../../api/auth.api";
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from "../../features/auth/schemas";

export const ForgotPasswordPage = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordFormSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Forgot password"
      subtitle="We'll email you a link to reset it"
      footer={
        <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <p className="text-emerald-600 dark:text-emerald-400">
          If an account exists for that email, a reset link has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
};
