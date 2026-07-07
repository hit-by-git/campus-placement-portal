import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";
import { notificationsApi } from "../../api/notifications.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";

const broadcastFormSchema = z.object({
  title: z.string().min(2, "Enter a title"),
  message: z.string().min(2, "Enter a message"),
  audience: z.enum(["ALL", "STUDENTS", "RECRUITERS"]),
});
type BroadcastFormValues = z.infer<typeof broadcastFormSchema>;

export const BroadcastPage = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues: { audience: "ALL" },
  });

  const onSubmit = async (values: BroadcastFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await notificationsApi.broadcast(values.title, values.message, values.audience);
      showToast(`Broadcast sent to ${res.data.notified} users`, "success");
      reset({ title: "", message: "", audience: values.audience });
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReminders = async () => {
    setIsSendingReminders(true);
    try {
      const res = await notificationsApi.sendDeadlineReminders();
      showToast(
        `Checked ${res.data.drivesChecked} closing-soon drives, sent ${res.data.notificationsSent} reminders`,
        "success"
      );
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSendingReminders(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-xl">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Broadcast a notification
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <TextField label="Title" error={errors.title?.message} {...register("title")} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
            <textarea
              rows={3}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register("message")}
            />
            {errors.message && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{errors.message.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Audience</label>
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register("audience")}
            >
              <option value="ALL">Everyone</option>
              <option value="STUDENTS">Students only</option>
              <option value="RECRUITERS">Recruiters only</option>
            </select>
          </div>
          <Button type="submit" isLoading={isSubmitting} className="self-start">
            Send broadcast
          </Button>
        </form>
      </Card>

      <Card className="max-w-xl">
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Application deadline reminders
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Notify eligible students who haven't applied yet about drives closing within 48 hours.
        </p>
        <Button type="button" variant="secondary" isLoading={isSendingReminders} onClick={handleSendReminders}>
          Send reminders now
        </Button>
      </Card>
    </div>
  );
};
