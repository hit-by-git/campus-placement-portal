import { useState } from "react";
import axios from "axios";
import { applicationsApi } from "../../api/applications.api";
import { useToast } from "../../context/ToastContext";

export const useApplyToDrive = (onApplied?: () => void) => {
  const { showToast } = useToast();
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const apply = async (driveId: string) => {
    setApplyingId(driveId);
    try {
      const res = await applicationsApi.apply(driveId);
      showToast(res.message, "success");
      onApplied?.();
    } catch (err) {
      let message = "Could not apply to this drive";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; details?: string[] } | undefined;
        message = data?.details?.length ? `${data.message}: ${data.details.join("; ")}` : data?.message ?? message;
      }
      showToast(message, "error");
    } finally {
      setApplyingId(null);
    }
  };

  return { apply, applyingId };
};
