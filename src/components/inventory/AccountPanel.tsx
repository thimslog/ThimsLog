"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, Pencil, Trash2, UserSquare2 } from "lucide-react";

import { AccountAPI } from "./InventoryAPI";

import {
  ConfirmDeleteModal,
  EmptyState,
  ErrorText,
  Field,
  FormActions,
  inputClass,
  Modal,
  PanelHeader,
} from "./SharedPrimitives";

import type {
  InventoryAccount,
  InventoryAccountStatus,
} from "./InventoryTypes";

interface AccountFormModalProps {
  accountTypeId: string;
  initial: InventoryAccount | null;
  onClose: () => void;
  onSaved: (account: InventoryAccount) => void;
}

interface AccountPanelProps {
  accountTypeId: string | null;
}

const ACCOUNT_STATUSES: InventoryAccountStatus[] = ["AVAILABLE", "SOLD"];

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

function AccountFormModal({
  accountTypeId,
  initial,
  onClose,
  onSaved,
}: AccountFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");

  const [followers, setFollowers] = useState<string>(
    initial?.followers?.toString() ?? "",
  );

  const [status, setStatus] = useState<InventoryAccountStatus>(
    initial?.status ?? "AVAILABLE",
  );

  const [notes, setNotes] = useState(initial?.notes ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const parsedFollowers =
        followers === "" ? null : Number.parseInt(followers, 10);

      if (
        followers !== "" &&
        (Number.isNaN(parsedFollowers) || parsedFollowers! < 0)
      ) {
        throw new Error("Followers must be a valid number");
      }

      const payload = {
        accountTypeId,
        name: name.trim() || null,
        username: username.trim() || null,
        email: email.trim() || null,
        url: url.trim() || null,
        country: country.trim() || null,
        followers: parsedFollowers,
        status,
        notes: notes.trim() || null,
      };

      const saved = initial
        ? await AccountAPI.update(initial.id, payload)
        : await AccountAPI.create(payload);

      if (!saved) {
        throw new Error("No account was returned");
      }

      onSaved(saved);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={initial ? "Edit account" : "New account"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorText error={error} />

        <Field label="Name">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Username">
          <input
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Profile URL">
          <input
            type="url"
            className={inputClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Country">
            <input
              className={inputClass}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </Field>

          <Field label="Followers">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Status">
          <select
            className={inputClass}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as InventoryAccountStatus)
            }
          >
            {ACCOUNT_STATUSES.map((accountStatus) => (
              <option key={accountStatus} value={accountStatus}>
                {accountStatus}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Notes">
          <textarea
            className={inputClass}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        <FormActions onCancel={onClose} submitting={submitting} />
      </form>
    </Modal>
  );
}

function statusBadgeClass(status: InventoryAccountStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-50 text-green-700";

    case "SOLD":
      return "bg-slate-100 text-slate-500";

    // case "RESERVED":
    //   return "bg-amber-50 text-amber-700";

    case "ASSIGNED":
      return "bg-blue-50 text-blue-700";

    case "SUSPENDED":
      return "bg-orange-50 text-orange-700";

    case "DISABLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-500";
  }
}

function AccountPanel({ accountTypeId }: AccountPanelProps) {
  const [accounts, setAccounts] = useState<InventoryAccount[]>([]);
  const [loading, setLoading] = useState(false);

  // undefined = modal closed
  // null = create new account
  // InventoryAccount = edit existing account
  const [formTarget, setFormTarget] = useState<
    InventoryAccount | null | undefined
  >(undefined);

  const [deleteTarget, setDeleteTarget] = useState<InventoryAccount | null>(
    null,
  );

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accountTypeId) {
      setAccounts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = (await AccountAPI.list(accountTypeId)) as any; // Type assertion to any to access the json() method

      const data = await response?.data;

      setAccounts(data ?? []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accountTypeId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSaved(saved: InventoryAccount) {
    setFormTarget(undefined);

    // setAccounts((prev) => {
    //   const exists = prev.some((account) => account.id === saved.id);

    //   if (exists) {
    //     return prev.map((account) =>
    //       account.id === saved.id ? saved : account,
    //     );
    //   }

    //   return [...prev, saved];
    // });
    load();
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await AccountAPI.remove(deleteTarget.id);

      setAccounts((prev) =>
        prev.filter((account) => account.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4">
      <PanelHeader
        title="Accounts"
        count={accountTypeId ? accounts.length : undefined}
        onAdd={() => setFormTarget(null)}
        addDisabled={!accountTypeId}
      />

      <ErrorText error={error} />

      {!accountTypeId ? (
        <EmptyState
          icon={UserSquare2}
          text="Select an account type to see its accounts overflow-hidden max-h-[calc(60vh-16rem)] overflow-y-auto"
        />
      ) : loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 size={18} className="animate-spin text-purple-500" />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState icon={UserSquare2} text="No accounts in this type yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-3 font-medium">Name / username</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Country</th>
                <th className="py-2 pr-3 font-medium">Followers</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-slate-800">
                      {account.name || account.username || "—"}
                    </p>

                    {account.username && account.name && (
                      <p className="text-xs text-slate-400">
                        @{account.username}
                      </p>
                    )}
                  </td>

                  <td className="py-2.5 pr-3 text-slate-500">
                    {account.email || "—"}
                  </td>

                  <td className="py-2.5 pr-3 text-slate-500">
                    {account.country || "—"}
                  </td>

                  <td className="py-2.5 pr-3 text-slate-500">
                    {account.followers ?? "—"}
                  </td>

                  <td className="py-2.5 pr-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadgeClass(
                        account.status,
                      )}`}
                    >
                      {account.status}
                    </span>
                  </td>

                  <td className="py-2.5 pr-1 text-right">
                    <button
                      type="button"
                      onClick={() => setFormTarget(account)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                      aria-label="Edit account"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(account)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      aria-label="Delete account"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formTarget !== undefined && accountTypeId && (
        <AccountFormModal
          accountTypeId={accountTypeId}
          initial={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete account"
          itemLabel={
            deleteTarget.name || deleteTarget.username || "this account"
          }
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          submitting={deleting}
        />
      )}
    </div>
  );
}

export { AccountFormModal, AccountPanel };

export type { AccountFormModalProps, AccountPanelProps };
