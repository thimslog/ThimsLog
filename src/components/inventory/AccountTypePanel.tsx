"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Loader2,
  Tag,
} from "lucide-react";

import { AccountTypeAPI } from "./InventoryAPI";

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

import type { AccountType } from "./InventoryTypes";

interface AccountTypeFormModalProps {
  categoryId: string;
  initial: AccountType | null;
  onClose: () => void;
  onSaved: (accountType: AccountType) => void;
}

interface AccountTypePanelProps {
  categoryId: string | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

function AccountTypeFormModal({
  categoryId,
  initial,
  onClose,
  onSaved,
}: AccountTypeFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");

  const [description, setDescription] = useState(
    initial?.description ?? ""
  );

  // Keep this as a string because it is connected to an input.
  const [price, setPrice] = useState(
    initial?.price?.toString() ?? "0.00"
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const parsedPrice = Number.parseFloat(price);

      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        throw new Error("Price must be a valid number");
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price: parsedPrice,
        categoryId,
      };

      const saved = initial
        ? await AccountTypeAPI.update(
            initial.id,
            payload
          )
        : await AccountTypeAPI.create(payload);

      if (!saved) {
        throw new Error("No account type was returned");
      }

      onSaved(saved);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={
        initial
          ? "Edit account type"
          : "New account type"
      }
      onClose={onClose}
    >
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
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </Field>

        <Field label="Price">
          <input
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Field>

        <FormActions
          onCancel={onClose}
          submitting={submitting}
        />
      </form>
    </Modal>
  );
}

function AccountTypePanel({
  categoryId,
  selectedId,
  onSelect,
}: AccountTypePanelProps) {
  const [types, setTypes] = useState<AccountType[]>([]);

  const [loading, setLoading] = useState(false);

  // undefined = modal closed
  // null = create new account type
  // AccountType = edit existing account type
  const [formTarget, setFormTarget] = useState<
    AccountType | null | undefined
  >(undefined);

  const [deleteTarget, setDeleteTarget] =
    useState<AccountType | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const load = useCallback(async () => {
    if (!categoryId) {
      setTypes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await AccountTypeAPI.list(categoryId) as any; // Type assertion to any to access the json() method

      const data = await response?.data;

      setTypes(data ?? []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    load();

    // Reset selected account type when category changes.
    onSelect(null);

    // onSelect intentionally excluded because this effect
    // should only run when categoryId changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, load]);

  function handleSaved(saved: AccountType) {
    setFormTarget(undefined);

    // setTypes((prev) => {
    //   const exists = prev.some(
    //     (type) => type.id === saved.id
    //   );

    //   if (exists) {
    //     return prev.map((type) =>
    //       type.id === saved.id ? saved : type
    //     );
    //   }

    //   return [...prev, saved];
    // });
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await AccountTypeAPI.remove(deleteTarget.id);

      setTypes((prev) =>
        prev.filter(
          (type) => type.id !== deleteTarget.id
        )
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

  return (
    <div className="bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xs">
      <PanelHeader
        title="Account types"
        count={
          categoryId ? types.length : undefined
        }
        onAdd={() => setFormTarget(null)}
        addDisabled={!categoryId}
      />

      <ErrorText error={error} />

      {!categoryId ? (
        <EmptyState
          icon={Tag}
          text="Select a category to see its account types"
        />
      ) : loading ? (
        <div className="py-8 flex justify-center">
          <Loader2
            size={20}
            className="animate-spin text-sky-600 dark:text-sky-400"
          />
        </div>
      ) : types.length === 0 ? (
        <EmptyState
          icon={Tag}
          text="No account types in this category yet"
        />
      ) : (
        <div className="space-y-1 max-h-[calc(60vh-16rem)] overflow-y-auto">
          {types.map((type) => {
            const availCount = type.availableAccountsCount ?? 0;
            const totalCount = type.totalAccountsCount ?? 0;

            return (
              <ListRow
                key={type.id}
                title={type.name}
                badge={
                  availCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                      {availCount} available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
                      0 available
                    </span>
                  )
                }
                subtitle={`₦${Number(type.price).toLocaleString("en-NG", { minimumFractionDigits: 2 })} • ${totalCount} total account${totalCount === 1 ? "" : "s"}`}
                active={type.id === selectedId}
                onClick={() => onSelect(type.id)}
                onEdit={() => setFormTarget(type)}
                onDelete={() => setDeleteTarget(type)}
              />
            );
          })}
        </div>
      )}

      {formTarget !== undefined && categoryId && (
        <AccountTypeFormModal
          categoryId={categoryId}
          initial={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete account type"
          itemLabel={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          submitting={deleting}
        />
      )}
    </div>
  );
}

export {
  AccountTypeFormModal,
  AccountTypePanel,
};

export type {
  AccountTypeFormModalProps,
  AccountTypePanelProps,
};