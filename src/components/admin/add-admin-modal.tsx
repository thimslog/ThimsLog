"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AddAdminModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
}

export function AddAdminModal({ open, onClose, onCreate }: AddAdminModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("ADMIN");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setRole("ADMIN");
    setError("");
  }

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("First name, last name and email are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/adminAuth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim() || undefined,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create admin");
      }

      resetForm();
      onClose();

      // Tell parent to refresh the admin list
      onCreate?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the admin.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;

    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-white/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-lg shadow-sm bg-white p-5 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-[16px] text-sky-900">Add admin</h2>
          <button
            onClick={handleClose}
            className="text-ink-faint hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-[12.5px] text-ink-muted mb-1.5">
              First name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Chinedu"
              className="w-full rounded-card border border-base-border bg-base-elevated px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint outline-none focus:border-brand"
              required
            />
          </div>

          <div>
            <label className="block text-[12.5px] text-ink-muted mb-1.5">
              Last name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Okafor"
              className="w-full rounded-card border border-base-border bg-base-elevated px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint outline-none focus:border-brand"
              required
            />
          </div>

          <div>
            <label className="block text-[12.5px] text-ink-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@platform.com"
              className="w-full rounded-card border border-base-border bg-base-elevated px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint outline-none focus:border-brand"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-muted">
              Phone number
            </label>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 08012345678"
              disabled={loading}
              className="w-full rounded-card border border-base-border bg-base-elevated px-3 py-2 text-[13.5px] text-ink outline-none placeholder:text-ink-faint focus:border-brand disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[12.5px] text-ink-muted mb-1.5">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-card border border-base-border bg-base-elevated px-3 py-2 text-[13.5px] text-ink outline-none focus:border-brand"
            >
              <option value="super_admin">Super admin</option>
              <option value="admin">Admin</option>
              <option value="support">Support</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2 text-[13px] text-sky-900 border border-sky-900 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={(e)=>handleSubmit(e)}
              className="rounded-md bg-sky-900 px-8 py-2 text-[13px] font-medium text-white hover:bg-brand/90 transition-colors"
            >
              {loading ? "Adding Admin..." : "Add admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
