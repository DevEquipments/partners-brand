import { useEffect, useRef, useId } from "react";
import { X } from "lucide-react";

export const Drawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "w-full sm:w-[500px] md:w-[560px]",
  footer,
  preventClose = false,
  closeOnBackdropClick = true,
  className = "",
  initialFocusRef,
}) => {
  const drawerRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const titleId = useId();
  const subtitleId = useId();

  const onCloseRef = useRef(onClose);
  const preventCloseRef = useRef(preventClose);
  const initialFocusRefRef = useRef(initialFocusRef);

  useEffect(() => {
    onCloseRef.current = onClose;
    preventCloseRef.current = preventClose;
    initialFocusRefRef.current = initialFocusRef;
  });

  // Handle focus management and Escape key - strictly bound to isOpen
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Place initial focus on first form input inside drawer body, excluding header buttons
    const timer = setTimeout(() => {
      if (initialFocusRefRef.current?.current) {
        initialFocusRefRef.current.current.focus();
      } else if (drawerRef.current) {
        const firstField = drawerRef.current.querySelector(
          'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])'
        );
        if (firstField) {
          firstField.focus();
        } else {
          drawerRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !preventCloseRef.current) {
        e.stopPropagation();
        onCloseRef.current?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow || "unset";
      window.removeEventListener("keydown", handleKeyDown);

      // Restore focus to previous element only when drawer closes
      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === "function"
      ) {
        try {
          previousActiveElementRef.current.focus();
        } catch {
          // Ignore
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
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in pointer-events-none"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        className={`relative ${width} bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-slide-left outline-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 shrink-0">
          <div className="min-w-0 pr-4">
            {title && (
              <h3
                id={titleId}
                className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate"
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                id={subtitleId}
                className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate"
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!preventClose) onClose?.();
            }}
            disabled={preventClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>

        {/* Sticky Footer if provided */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
