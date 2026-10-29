import { forwardRef } from "react";
import Modal from "./Modal";
import Form from "./Form";
import Button from "./Button";

export const FormModal = forwardRef(
  (
    {
      isOpen,
      onClose,
      title,
      subtitle,
      fields = [],
      values = {},
      onChange,
      errors = {},
      formError,
      isSubmitting = false,
      submitDisabled = false,
      submitText = "Save Changes",
      cancelText = "Cancel",
      onSubmit,
      children,
      banner,
      maxWidth = "max-w-lg",
      preventClose,
      gridClassName,
      className = "",
      ...props
    },
    ref
  ) => {
    const isLocked = preventClose ?? isSubmitting;

    const modalFooter = (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          disabled={isSubmitting || submitDisabled}
          onClick={onSubmit}
        >
          {submitText}
        </Button>
      </>
    );

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        maxWidth={maxWidth}
        preventClose={isLocked}
        footer={modalFooter}
        className={className}
      >
        <div className="space-y-4">
          {banner && <div>{banner}</div>}

          <Form
            ref={ref}
            fields={fields}
            values={values}
            onChange={onChange}
            errors={errors}
            formError={formError}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            hideActions
            gridClassName={gridClassName}
            {...props}
          >
            {children}
          </Form>
        </div>
      </Modal>
    );
  }
);

FormModal.displayName = "FormModal";

export default FormModal;
