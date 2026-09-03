"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { Loader2, FolderOpen } from "lucide-react";

import { CategoryAPI } from "./InventoryAPI";

import {
  ConfirmDeleteModal,
  EmptyState,
  ErrorText,
  Field,
  FormActions,
  inputClass,
  ListRow,
  Modal,
  PanelHeader,
} from "./SharedPrimitives";

/* =========================
   Types
========================= */

type CategoryStatus = "ACTIVE" | "INACTIVE";

interface Category {
  id: string;
  name: string;
  description: string | null;
  status: CategoryStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryFormModalProps {
  initial: Category | null;
  onClose: () => void;
  onSaved: (category: Category) => void;
}

/* =========================
   Constants
========================= */

const CATEGORY_STATUSES: CategoryStatus[] = ["ACTIVE", "INACTIVE"];

/* =========================
   Helpers
========================= */

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

/* =========================
   Category Form Modal
========================= */

function CategoryFormModal({
  initial,
  onClose,
  onSaved,
}: CategoryFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");

  const [description, setDescription] = useState(initial?.description ?? "");

  const [status, setStatus] = useState<CategoryStatus>(
    initial?.status ?? "ACTIVE",
  );

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name,
        description: description || null,
        status,
      };

      const saved = initial
        ? await CategoryAPI.update(initial.id, payload)
        : await CategoryAPI.create(payload);

      if (!saved) {
        throw new Error("No category was returned");
      }

      onSaved(saved as Category);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={initial ? "Edit category" : "New category"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorText error={error} />

        <Field label="Name">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <Field label="Description">
          <textarea
            className={inputClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label="Status">
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as CategoryStatus)}
          >
            {CATEGORY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <FormActions onCancel={onClose} submitting={submitting} />
      </form>
    </Modal>
  );
}

/* =========================
   Category Panel
========================= */

interface CategoryPanelProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function CategoryPanel({ selectedId, onSelect }: CategoryPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);

  /*
    undefined = modal closed
    null      = creating new category
    Category  = editing category
  */
  const [formTarget, setFormTarget] = useState<Category | null | undefined>(
    undefined,
  );

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =========================
     Load categories
  ========================= */

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = (await CategoryAPI.list()) as any; // Type assertion to any to access the json() method
      const data = await response?.data;

      setCategories((data ?? []) as Category[]);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* =========================
     Saved
  ========================= */

  function handleSaved(saved: Category) {
    setFormTarget(undefined);

    // setCategories((prev) => {
    //   const exists = prev.some((category) => category.id === saved.id);

    //   return exists
    //     ? prev.map((category) => (category.id === saved.id ? saved : category))
    //     : [...prev, saved];
    // });
    load();
  }

  /* =========================
     Delete
  ========================= */

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError(null);

    try {
      await CategoryAPI.remove(deleteTarget.id);

      setCategories((prev) =>
        prev.filter((category) => category.id !== deleteTarget.id),
      );

      if (selectedId === deleteTarget.id) {
        onSelect(null);
      }

      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  /* =========================
     Render
  ========================= */

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4">
      <PanelHeader
        title="Categories"
        count={categories.length}
        onAdd={() => setFormTarget(null)}
      />

      <ErrorText error={error} />

      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 size={18} className="animate-spin text-purple-500" />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderOpen} text="No categories yet" />
      ) : (
        <div className="space-y-1 overflow-hidden max-h-[calc(60vh-16rem)] overflow-y-auto">
          {categories.map((category) => (
            <ListRow
              key={category.id}
              title={category.name}
              subtitle={category.status}
              active={category.id === selectedId}
              onClick={() => onSelect(category.id)}
              onEdit={() => setFormTarget(category)}
              onDelete={() => setDeleteTarget(category)}
            />
          ))}
        </div>
      )}

      {formTarget !== undefined && (
        <CategoryFormModal
          initial={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete category"
          itemLabel={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          submitting={deleting}
        />
      )}
    </div>
  );
}

export { CategoryFormModal, CategoryPanel };

export type { Category, CategoryStatus };
