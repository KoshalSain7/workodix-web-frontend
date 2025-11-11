"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 3000;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - (100 / (duration / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-success" />;
      case "error":
        return <XCircle className="h-6 w-6 text-error" />;
      case "warning":
        return <AlertCircle className="h-6 w-6 text-warning" />;
      default:
        return <AlertCircle className="h-6 w-6 text-info" />;
    }
  };

  const getProgressColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-success";
      case "error":
        return "bg-error";
      case "warning":
        return "bg-warning";
      default:
        return "bg-info";
    }
  };

  return (
    <div className="relative bg-gray-800 rounded-lg shadow-lg p-4 min-w-[320px] max-w-md animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{toast.message}</p>
          {toast.description && (
            <p className="text-gray-400 text-xs mt-1">{toast.description}</p>
          )}
          <div className="mt-3">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor()} transition-all duration-50 ease-linear`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Helper function to show toast
export const toast = {
  success: (message: string, description?: string) => {
    useToastStore.getState().addToast({ message, description, type: "success" });
  },
  error: (message: string, description?: string) => {
    useToastStore.getState().addToast({ message, description, type: "error" });
  },
  warning: (message: string, description?: string) => {
    useToastStore.getState().addToast({ message, description, type: "warning" });
  },
  info: (message: string, description?: string) => {
    useToastStore.getState().addToast({ message, description, type: "info" });
  },
};

