"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warn" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warn: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let globalToastHandler: ToastContextValue | null = null;

/**
 * Universal toast caller that works anywhere in client components
 * Usage: toast.success("Copied!"), toast.error("Failed"), toast.info("Pending")
 */
export const toast = {
  success: (msg: string, duration = 4000) => globalToastHandler?.success(msg, duration),
  error: (msg: string, duration = 5000) => globalToastHandler?.error(msg, duration),
  warn: (msg: string, duration = 4000) => globalToastHandler?.warn(msg, duration),
  warning: (msg: string, duration = 4000) => globalToastHandler?.warn(msg, duration),
  info: (msg: string, duration = 4000) => globalToastHandler?.info(msg, duration),
  show: (msg: string, type: ToastType = "info", duration = 4000) =>
    globalToastHandler?.show(msg, type, duration),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "info", duration = 4500) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  const success = useCallback(
    (message: string, duration = 4000) => show(message, "success", duration),
    [show]
  );
  const error = useCallback(
    (message: string, duration = 5000) => show(message, "error", duration),
    [show]
  );
  const warn = useCallback(
    (message: string, duration = 4000) => show(message, "warn", duration),
    [show]
  );
  const info = useCallback(
    (message: string, duration = 4000) => show(message, "info", duration),
    [show]
  );

  useEffect(() => {
    globalToastHandler = { show, success, error, warn, info, remove };
    return () => {
      globalToastHandler = null;
    };
  }, [show, success, error, warn, info, remove]);

  return (
    <ToastContext.Provider value={{ show, success, error, warn, info, remove }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return toast;
  }
  return ctx;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastCard({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const { id, type, message, duration = 4000 } = item;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const config = {
    success: {
      bg: "bg-white dark:bg-[#0f172a] border-emerald-500/30 dark:border-emerald-500/20 text-slate-800 dark:text-white",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
      bar: "bg-emerald-500",
    },
    error: {
      bg: "bg-white dark:bg-[#0f172a] border-rose-500/30 dark:border-rose-500/20 text-slate-800 dark:text-white",
      icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
      bar: "bg-rose-500",
    },
    warn: {
      bg: "bg-white dark:bg-[#0f172a] border-amber-500/30 dark:border-amber-500/20 text-slate-800 dark:text-white",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
      bar: "bg-amber-500",
    },
    warning: {
      bg: "bg-white dark:bg-[#0f172a] border-amber-500/30 dark:border-amber-500/20 text-slate-800 dark:text-white",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
      bar: "bg-amber-500",
    },
    info: {
      bg: "bg-white dark:bg-[#0f172a] border-sky-500/30 dark:border-sky-500/20 text-slate-800 dark:text-white",
      icon: <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />,
      bar: "bg-sky-500",
    },
  }[type] || {
    bg: "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white",
    icon: <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />,
    bar: "bg-sky-500",
  };

  return (
    <div
      className={`pointer-events-auto relative flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all animate-in slide-in-from-top-3 fade-in duration-200 overflow-hidden ${config.bg}`}
    >
      {config.icon}
      <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed pr-2">
        {message}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
      >
        <X size={15} />
      </button>

      {/* Progress countdown indicator */}
      <div
        className={`absolute bottom-0 left-0 h-[2.5px] ${config.bar} opacity-60`}
        style={{
          width: "100%",
          animation: `toastProgress ${duration}ms linear forwards`,
        }}
      />
    </div>
  );
}
