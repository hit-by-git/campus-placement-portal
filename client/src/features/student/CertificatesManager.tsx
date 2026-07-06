import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { Modal } from "../../components/ui/Modal";
import { studentsApi } from "../../api/students.api";
import { getErrorMessage } from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import type { Certificate } from "../../types";
import { certificateFormSchema, type CertificateFormValues } from "./schemas";

const CertificateForm = ({
  initial,
  onSubmit,
  isSubmitting,
}: {
  initial?: Certificate;
  onSubmit: (values: CertificateFormValues) => void;
  isSubmitting: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      title: initial?.title ?? "",
      issuer: initial?.issuer ?? "",
      url: initial?.url ?? "",
      issuedDate: initial?.issuedDate?.slice(0, 10) ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <TextField label="Title" error={errors.title?.message} {...register("title")} />
      <TextField label="Issuer" error={errors.issuer?.message} {...register("issuer")} />
      <TextField label="URL" error={errors.url?.message} {...register("url")} />
      <TextField label="Issued date" type="date" error={errors.issuedDate?.message} {...register("issuedDate")} />
      <Button type="submit" isLoading={isSubmitting} className="mt-2 self-start">
        Save
      </Button>
    </form>
  );
};

export const CertificatesManager = ({
  certificates,
  onChange,
}: {
  certificates: Certificate[];
  onChange: () => void;
}) => {
  const { showToast } = useToast();
  const [modalMode, setModalMode] = useState<"closed" | "add" | Certificate>("closed");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalize = (values: CertificateFormValues) => ({
    ...values,
    url: values.url || undefined,
    issuedDate: values.issuedDate || undefined,
  });

  const handleAdd = async (values: CertificateFormValues) => {
    setIsSubmitting(true);
    try {
      await studentsApi.addCertificate(normalize(values));
      setModalMode("closed");
      onChange();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, values: CertificateFormValues) => {
    setIsSubmitting(true);
    try {
      await studentsApi.updateCertificate(id, normalize(values));
      setModalMode("closed");
      onChange();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await studentsApi.deleteCertificate(id);
      onChange();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div>
      <ul className="mb-3 flex flex-col gap-2">
        {certificates.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No certificates added yet.</p>
        )}
        {certificates.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
          >
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">{c.title}</p>
              {c.issuer && <p className="text-xs text-slate-500 dark:text-slate-400">{c.issuer}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalMode(c)}
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="text-rose-600 hover:underline dark:text-rose-400"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Button type="button" variant="secondary" onClick={() => setModalMode("add")}>
        Add certificate
      </Button>

      <Modal title="Add certificate" isOpen={modalMode === "add"} onClose={() => setModalMode("closed")}>
        <CertificateForm onSubmit={handleAdd} isSubmitting={isSubmitting} />
      </Modal>

      <Modal
        title="Edit certificate"
        isOpen={modalMode !== "closed" && modalMode !== "add"}
        onClose={() => setModalMode("closed")}
      >
        {modalMode !== "closed" && modalMode !== "add" && (
          <CertificateForm
            initial={modalMode}
            onSubmit={(values) => handleUpdate(modalMode.id, values)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};
