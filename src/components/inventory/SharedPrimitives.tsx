import type { ReactNode, MouseEvent } from "react";
import type { LucideIcon } from "lucide-react";

import {
  X,
  Loader2,
  Pencil,
  Trash2,
  ChevronRight,
  Plus,
} from "lucide-react";

/* =========================
   Modal
========================= */

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
}

function Modal({
  title,
  onClose,
  children,
  maxWidthClass = "max-w-md",
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full ${maxWidthClass} max-h-[90vh] flex flex-col my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Field
========================= */

interface FieldProps {
  label: string;
  children: ReactNode;
}

function Field({
  label,
  children,
}: FieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
        {label}
      </label>

      {children}
    </div>
  );
}

/* =========================
   Input class
========================= */

export const inputClass =
  "w-full border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors";

/* =========================
   Form Actions
========================= */

interface FormActionsProps {
  onCancel: () => void;
  submitting: boolean;
  submitLabel?: string;
}

function FormActions({
  onCancel,
  submitting,
  submitLabel = "Save",
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
      >
        {submitting && (
          <Loader2
            size={14}
            className="animate-spin"
          />
        )}

        {submitLabel}
      </button>
    </div>
  );
}

/* =========================
   Error Text
========================= */

interface ErrorTextProps {
  error?: string | null;
}

function ErrorText({
  error,
}: ErrorTextProps) {
  if (!error) return null;

  return (
    <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
      {error}
    </div>
  );
}

/* =========================
   Confirm Delete Modal
========================= */

interface ConfirmDeleteModalProps {
  title: string;
  itemLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

function ConfirmDeleteModal({
  title,
  itemLabel,
  onCancel,
  onConfirm,
  submitting,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
    >
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
        Delete{" "}
        <span className="font-semibold text-slate-900 dark:text-white">
          {itemLabel}
        </span>
        ? This action cannot be undone, and related records may be removed too.
      </p>

      <div className="flex justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
        >
          {submitting && (
            <Loader2
              size={14}
              className="animate-spin"
            />
          )}

          Delete
        </button>
      </div>
    </Modal>
  );
}

/* =========================
   Empty State
========================= */

interface EmptyStateProps {
  icon: LucideIcon;
  text: string;
}

function EmptyState({
  icon: Icon,
  text,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400 dark:text-slate-500">
      <Icon
        size={28}
        className="mb-2 opacity-60"
      />

      <p className="text-sm">
        {text}
      </p>
    </div>
  );
}

/* =========================
   List Row
========================= */

interface ListRowProps {
  title: string;
  subtitle?: string | null;
  active?: boolean;
  onClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ListRow({
  title,
  subtitle,
  active = false,
  onClick,
  onEdit,
  onDelete,
}: ListRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl ${
        onClick ? "cursor-pointer" : ""
      } border transition-all ${
        active
          ? "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-900 dark:text-sky-100 shadow-xs"
          : "border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03] text-slate-800 dark:text-slate-200"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">
          {title}
        </p>

        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
          aria-label="Edit item"
        >
          <Pencil size={14} />
        </button>

        <button
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          aria-label="Delete item"
        >
          <Trash2 size={14} />
        </button>

        {onClick && (
          <ChevronRight
            size={14}
            className={`transition-transform ${active ? "text-sky-600 dark:text-sky-400 translate-x-0.5" : "text-slate-300 dark:text-slate-600"}`}
          />
        )}
      </div>
    </div>
  );
}

/* =========================
   Panel Header
========================= */

interface PanelHeaderProps {
  title: string;
  count?: number;
  onAdd: () => void;
  addDisabled?: boolean;
  addLabel?: string;
}

function PanelHeader({
  title,
  count,
  onAdd,
  addDisabled = false,
  addLabel = "Add",
}: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
        {title}

        {typeof count === "number" && (
          <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5 text-xs">
            ({count})
          </span>
        )}
      </h2>

      <button
        type="button"
        onClick={onAdd}
        disabled={addDisabled}
        className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 border border-sky-200/60 dark:border-sky-500/20 px-3 py-1.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <Plus size={14} />
        {addLabel}
      </button>
    </div>
  );
}

export {
  Modal,
  Field,
  FormActions,
  ErrorText,
  ConfirmDeleteModal,
  EmptyState,
  ListRow,
  PanelHeader,
};