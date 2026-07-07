import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";
import { FullPageSpinner } from "../../components/ui/Spinner";
import { companiesApi } from "../../api/companies.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import type { Company } from "../../types";
import { companyFormSchema, type CompanyFormValues } from "../../features/recruiter/schemas";

export const CompanyPage = () => {
  const { showToast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({ resolver: zodResolver(companyFormSchema) });

  useEffect(() => {
    companiesApi
      .getMyCompany()
      .then((c) => {
        setCompany(c);
        reset({ name: c.name, description: c.description ?? "", website: c.website ?? "" });
      })
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: CompanyFormValues) => {
    if (!company) return;
    setIsSubmitting(true);
    try {
      const res = await companiesApi.update(company.id, {
        ...values,
        website: values.website || undefined,
      });
      setCompany(res.data);
      showToast(res.message, "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <FullPageSpinner />;
  if (!company) return null;

  return (
    <Card className="max-w-xl">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Company details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <TextField label="Name" error={errors.name?.message} {...register("name")} />
        <TextField label="Website" error={errors.website?.message} {...register("website")} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            rows={4}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            {...register("description")}
          />
        </div>
        <Button type="submit" isLoading={isSubmitting} className="self-start">
          Save changes
        </Button>
      </form>
    </Card>
  );
};
