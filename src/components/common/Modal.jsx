import { useEffect, useRef, useId } from "react";
import { X } from "lucide-react";

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-lg",
  showClose = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventClose = false,
  className = "",
  initialFocusRef,
}) => {
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const titleId = useId();
  const subtitleId = useId();

  const onCloseRef = useRef(onClose);
  const preventCloseRef = useRef(preventClose);
  const closeOnEscapeRef = useRef(closeOnEscape);
  const initialFocusRefRef = useRef(initialFocusRef);

  useEffect(() => {
    onCloseRef.current = onClose;
    preventCloseRef.current = preventClose;
    closeOnEscapeRef.current = closeOnEscape;
    initialFocusRefRef.current = initialFocusRef;
  });

  // Handle focus management and Escape key - strictly bound to isOpen transitions
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element before modal opened
    previousActiveElementRef.current = document.activeElement;

    // Set body overflow
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Place initial focus ONCE when modal opens:
    // Focus initialFocusRef if specified, or the first form input inside the content body.
    // Crucial: Exclude header close buttons so typing never gets stolen.
    const timer = setTimeout(() => {
      if (initialFocusRefRef.current?.current) {
        initialFocusRefRef.current.current.focus();
      } else if (modalRef.current) {
        const firstField = modalRef.current.querySelector(
          'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])'
        );
        if (firstField) {
          firstField.focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEscapeRef.current && !preventCloseRef.current) {
        e.stopPropagation();
        onCloseRef.current?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow || "unset";
      window.removeEventListener("keydown", handleKeyDown);

      // Restore focus to previous element only when modal closes
      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === "function"
      ) {
        try {
          previousActiveElementRef.current.focus();
        } catch {
          // Ignore if previous element was unmounted
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick && !preventClose) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in pointer-events-none"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-scale-in outline-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
            <div>
              {title && (
                <h3
                  id={titleId}
                  className="text-sm font-bold text-slate-900 dark:text-slate-100"
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  id={subtitleId}
                  className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
                >
                  {subtitle}
                </p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={() => {
                  if (!preventClose) onClose?.();
                }}
                disabled={preventClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Optional Stable Footer */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
