import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "../components/ui/AuthCard";
import { TextField } from "../components/ui/TextField";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../api/axiosClient";
import { loginFormSchema, type LoginFormValues } from "../features/auth/schemas";

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (err) {
      showToast(getErrorMessage(err, "Invalid email or password"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Access your Campus Placement Portal account"
      footer={
        <div className="flex flex-col gap-1 text-slate-500 dark:text-slate-400">
          <Link to="/forgot-password" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Forgot your password?
          </Link>
          <span>
            New here?{" "}
            <Link to="/register/student" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Register as Student
            </Link>{" "}
            ·{" "}
            <Link to="/register/recruiter" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Recruiter
            </Link>
          </span>
        </div>
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>
    </AuthCard>
  );
};
