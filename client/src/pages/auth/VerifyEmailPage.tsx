import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthCard } from "../../components/ui/AuthCard";
import { Spinner } from "../../components/ui/Spinner";
import { authApi } from "../../api/auth.api";
import { getErrorMessage } from "../../api/axiosClient";

type VerifyState = "verifying" | "success" | "error";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Missing verification token.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setState("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setState("error");
        setMessage(getErrorMessage(err, "Verification link is invalid or has expired"));
      });
  }, [token]);

  return (
    <AuthCard
      title="Email verification"
      footer={
        <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Go to login
        </Link>
      }
    >
      {state === "verifying" && (
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Spinner className="h-5 w-5" />
          Verifying your email...
        </div>
      )}
      {state === "success" && <p className="text-emerald-600 dark:text-emerald-400">{message}</p>}
      {state === "error" && <p className="text-rose-600 dark:text-rose-400">{message}</p>}
    </AuthCard>
  );
};
