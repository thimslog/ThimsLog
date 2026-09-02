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
}

function Modal({
  title,
  onClose,
  children,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
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
      <label className="block text-xs font-medium text-slate-500 mb-1">
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
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";


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
    <div className="flex justify-end gap-2 mt-5">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-60"
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
    <p className="text-xs text-red-500 mb-3">
      {error}
    </p>
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
      <p className="text-sm text-slate-600 mb-5">
        Delete{" "}
        <span className="font-medium text-slate-900">
          {itemLabel}
        </span>
        ? This can't be undone, and related records may be removed too.
      </p>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60"
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
    <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400">
      <Icon
        size={28}
        className="mb-2"
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
      className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg ${
        onClick ? "cursor-pointer" : ""
      } border transition-colors ${
        active
          ? "bg-purple-50 border-purple-200"
          : "border-transparent hover:bg-slate-50"
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {title}
        </p>

        {subtitle && (
          <p className="text-xs text-slate-400 truncate">
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
          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded"
        >
          <Pencil size={14} />
        </button>

        <button
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 size={14} />
        </button>

        {onClick && (
          <ChevronRight
            size={14}
            className="text-slate-300"
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
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-slate-700">
        {title}

        {typeof count === "number" && (
          <span className="text-slate-400 font-normal">
            {" "}
            ({count})
          </span>
        )}
      </h2>

      <button
        type="button"
        onClick={onAdd}
        disabled={addDisabled}
        className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus size={13} />

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