"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import {
  PasswordRequirements,
  passwordMeetsRequirements,
} from "@/components/auth/password-requirements";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  // In production: resolve `token` server-side to find the invited admin's
  // email/name before rendering the form, and reject expired/invalid tokens.
  const invitedEmail = searchParams.get("email") ?? "your invited email";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // const requirementsMet = passwordMeetsRequirements(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault();

  setError(null);

  if (!token) {
    setError(
      "This invite link is missing or invalid. Ask a super admin to resend it.",
    );
    return;
  }

  if (!passwordMeetsRequirements(password)) {
    setError("Password doesn't meet the requirements below.");
    return;
  }

  if (!passwordsMatch) {
    setError("Passwords don't match.");
    return;
  }

  setSubmitting(true);

  try {
    const response = await fetch("/api/adminAuth/set-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: invitedEmail,
        token,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data?.message || "Failed to set password",
      );
    }

    setDone(true);
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.",
    );
  } finally {
    setSubmitting(false);
  }
}

  if (done) {
    return (
      <AuthShell
        title="Password set"
        subtitle="Your account is ready to use."
      >
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <CheckCircle2 size={32} className="text-sky-900" />
          <p className="text-[13px] text-sky-900">
            You can now sign in with your new password.
          </p>
          <button
            onClick={() => router.push("/admin/login")}
            className="mt-1 w-full rounded-card bg-sky-900 px-3.5 py-2 text-[13px] font-medium text-sky-100 hover:bg-brand/90 transition-colors"
          >
            Go to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set your password"
      subtitle={`Create a password for ${invitedEmail}`}
    >
      <form className="space-y-4">
        <div>
          <PasswordField
            id="password"
            label="New password"
            value={password}
            onChange={setPassword}
          />
          <PasswordRequirements password={password} />
        </div>

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {error && (
          <p className="text-[12.5px] text-bad bg-bad-soft rounded-card px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          onClick={handleSubmit}
          className="w-full rounded-card bg-brand px-3.5 py-2 text-[14px] font-medium text-white bg-sky-900 transition-colors disabled:opacity-60"
        >
          {submitting ? "Setting password…" : "Set Password"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetPasswordForm />
    </Suspense>
  );
}
