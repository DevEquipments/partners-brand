import { useState } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import { Plus, Save } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../../utils/errorHandler";

export const PermissionFormModal = ({
  isOpen,
  onClose,
  mode = "add", // 'add' | 'edit'
  initialData = null,
  onSubmit,
  isSubmitting = false,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [errors, setErrors] = useState({});
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    Boolean(initialData?.slug)
  );

  const isPending = isSubmitting || internalSubmitting;

  // Auto-generate suggested slug while typing name if not manually modified
  const handleNameChange = (val) => {
    setName(val);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: null }));
    }

    if (mode === "add" && !isSlugManuallyEdited) {
      // Suggest camel/pascal slug like "CustomerEnquiry" from "Customer Enquiry"
      const suggested = val
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(/\s+/)
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
        .join("");
      setSlug(suggested);
    }
  };

  const handleSlugChange = (val) => {
    setSlug(val);
    setIsSlugManuallyEdited(true);
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isPending) return;

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    const newErrors = {};
    if (!trimmedName) {
      newErrors.name = "Permission Name is required.";
    }
    if (!trimmedSlug) {
      newErrors.slug = "Slug is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: trimmedName,
      slug: trimmedSlug,
    };

    if (mode === "edit" && initialData?.id !== undefined) {
      payload.id = initialData.id;
    }

    setInternalSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      // Handle field-level validation errors such as "The slug has already been taken."
      const slugErr =
        err?.errors?.slug ||
        err?.data?.errors?.slug ||
        (typeof err?.message === "string" && err.message.toLowerCase().includes("slug")
          ? err.message
          : null);

      if (slugErr) {
        setErrors((prev) => ({
          ...prev,
          slug: Array.isArray(slugErr) ? slugErr[0] : slugErr,
        }));
      }

      const nameErr = err?.errors?.name || err?.data?.errors?.name;
      if (nameErr) {
        setErrors((prev) => ({
          ...prev,
          name: Array.isArray(nameErr) ? nameErr[0] : nameErr,
        }));
      }

      // Display one error toast only if not already shown by Axios interceptor
      if (!err?.toastShown) {
        const fallbackMsg =
          mode === "add" ? "Failed to add permission." : "Failed to update permission.";
        toast.error(getApiErrorMessage(err, fallbackMsg), {
          id: "permission-modal-error",
        });
      }
    } finally {
      setInternalSubmitting(false);
    }
  };

  const title = mode === "add" ? "Add Permission" : "Edit Permission";
  const subtitle =
    mode === "add"
      ? "Register a new permission module for the Partners Admin workspace."
      : `Update permission module details for #${initialData?.id || ""}.`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="max-w-md"
      showClose={!isPending}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <Input
          label="Permission Name *"
          placeholder="e.g. Customer Enquiry"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={errors.name}
          disabled={isPending}
          autoFocus
        />

        {/* Slug Input */}
        <Input
          label="Slug *"
          placeholder="e.g. CustomerEnquiry"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          error={errors.slug}
          disabled={isPending}
          helperText="Exact identifier used by the backend API authorization layer."
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isPending}
            disabled={isPending}
            icon={mode === "add" ? Plus : Save}
          >
            {mode === "add" ? "Add Permission" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PermissionFormModal;
