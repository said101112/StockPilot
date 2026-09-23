import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, title = "Succès") => showToast("success", message, title),
    [showToast]
  );

  const showError = useCallback(
    (message: string, title = "Erreur") => showToast("error", message, title, 5000),
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title = "Attention") => showToast("warning", message, title),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title = "Information") => showToast("info", message, title),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo, removeToast }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 sm:right-6 z-[9999999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";
          const isInfo = toast.type === "info";

          const bgStyle = isSuccess
            ? "bg-white/95 dark:bg-gray-850/95 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10"
            : isError
            ? "bg-white/95 dark:bg-gray-850/95 border-rose-500/40 text-rose-950 dark:text-rose-100 shadow-rose-500/10"
            : isWarning
            ? "bg-white/95 dark:bg-gray-850/95 border-amber-500/40 text-amber-950 dark:text-amber-100 shadow-amber-500/10"
            : "bg-white/95 dark:bg-gray-850/95 border-sky-500/40 text-sky-950 dark:text-sky-100 shadow-sky-500/10";

          const iconColor = isSuccess
            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400"
            : isError
            ? "text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400"
            : isWarning
            ? "text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400"
            : "text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 ${bgStyle}`}
              role="alert"
            >
              <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
                {isSuccess && <CheckCircle2 className="w-5 h-5" />}
                {isError && <AlertCircle className="w-5 h-5" />}
                {isWarning && <AlertTriangle className="w-5 h-5" />}
                {isInfo && <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                {toast.title && (
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs text-gray-700 dark:text-gray-200 mt-1 break-words leading-relaxed font-medium">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50 -mr-1 -mt-1"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
