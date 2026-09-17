"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, Pencil, Trash2, UserSquare2, FileText, KeyRound } from "lucide-react";

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

const ACCOUNT_STATUSES: InventoryAccountStatus[] = [
  "AVAILABLE",
  "ASSIGNED",
  "SOLD",
  "SUSPENDED",
  "DISABLED",
];

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
  const [loginInstructions, setLoginInstructions] = useState(
    initial?.loginInstructions ?? "",
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const parsedFollowers =
        followers.trim() === "" ? null : Number.parseInt(followers.trim(), 10);

      if (
        followers.trim() !== "" &&
        (Number.isNaN(parsedFollowers) || parsedFollowers! < 0)
      ) {
        throw new Error("Followers must be a valid non-negative number");
      }

      const payload = {
        accountTypeId,
        username: username.trim() || null,
        email: email.trim() || null,
        url: url.trim() || null,
        country: country.trim() || null,
        followers: parsedFollowers,
        status,
        notes: notes.trim() || null,
        loginInstructions: loginInstructions.trim() || null,
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
    <Modal
      title={initial ? "Edit Account" : "New Account"}
      onClose={onClose}
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        <ErrorText error={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Username (Optional)">
            <input
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. handle_123"
            />
          </Field>

          <Field label="Email (Optional)">
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="account@email.com"
            />
          </Field>
        </div>

        <Field label="Profile URL (Optional)">
          <input
            type="url"
            className={inputClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Country (Optional)">
            <input
              className={inputClass}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. USA, UK, NG"
            />
          </Field>

          <Field label="Followers (Optional)">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              placeholder="e.g. 5000"
            />
          </Field>
        </div>

        <Field label="Status">
          <select
            required
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

        <Field label="Instructions Before Buying (Notes)">
          <textarea
            className={inputClass}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instructions or requirements before purchasing (e.g. Must have active 2FA app, warranty terms)..."
          />
        </Field>

        <Field label="Login Instructions">
          <textarea
            className={inputClass}
            rows={2}
            value={loginInstructions}
            onChange={(e) => setLoginInstructions(e.target.value)}
            placeholder="Detailed instructions on how buyer should log in after purchase (e.g. Login via session cookie, password format, backup codes)..."
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
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20";

    case "SOLD":
      return "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200/60 dark:border-white/10";

    case "ASSIGNED":
      return "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/20";

    case "SUSPENDED":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20";

    case "DISABLED":
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20";

    default:
      return "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200/60 dark:border-white/10";
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
      const response = (await AccountAPI.list(accountTypeId)) as any;
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

  const availableCount = accounts.filter((a) => a.status === "AVAILABLE").length;

  return (
    <div className="bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xs">
      <PanelHeader
        title="Accounts"
        count={accountTypeId ? `${availableCount} available / ${accounts.length} total` : undefined}
        onAdd={() => setFormTarget(null)}
        addDisabled={!accountTypeId}
      />

      <ErrorText error={error} />

      {!accountTypeId ? (
        <EmptyState
          icon={UserSquare2}
          text="Select an account type to see its accounts"
        />
      ) : loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 size={20} className="animate-spin text-sky-600 dark:text-sky-400" />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState icon={UserSquare2} text="No accounts in this type yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 font-semibold">
                <th className="py-3 pr-3">Account / Username</th>
                <th className="py-3 pr-3">Email</th>
                <th className="py-3 pr-3">Country</th>
                <th className="py-3 pr-3">Followers</th>
                <th className="py-3 pr-3">Instructions</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {account.username || account.name || account.id.slice(0, 8)}
                    </p>
                    {account.url && (
                      <a
                        href={account.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-600 dark:text-sky-400 hover:underline truncate max-w-[150px] block mt-0.5"
                      >
                        {account.url}
                      </a>
                    )}
                  </td>

                  <td className="py-3 pr-3 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {account.email || "—"}
                  </td>

                  <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                    {account.country || "—"}
                  </td>

                  <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                    {account.followers !== null && account.followers !== undefined
                      ? Number(account.followers).toLocaleString()
                      : "—"}
                  </td>

                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      {account.notes && (
                        <span
                          title={`Pre-buy note: ${account.notes}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 text-[11px] font-semibold"
                        >
                          <FileText size={11} /> Note
                        </span>
                      )}
                      {account.loginInstructions && (
                        <span
                          title={`Login instruction: ${account.loginInstructions}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/20 text-[11px] font-semibold"
                        >
                          <KeyRound size={11} /> Login Info
                        </span>
                      )}
                      {!account.notes && !account.loginInstructions && (
                        <span className="text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 pr-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusBadgeClass(
                        account.status,
                      )}`}
                    >
                      {account.status}
                    </span>
                  </td>

                  <td className="py-3 pr-1 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setFormTarget(account)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                        aria-label="Edit account"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(account)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        aria-label="Delete account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
            deleteTarget.username ||
            deleteTarget.email ||
            deleteTarget.name ||
            "this account"
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
