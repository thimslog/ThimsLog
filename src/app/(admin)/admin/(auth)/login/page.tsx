"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inactivityNotice, setInactivityNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "inactivity") {
        setInactivityNotice(true);
      }
    }
  }, []);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await fetch("/api/admin/getCurrentAdmin", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (response.ok) {
          router.replace("/admin/dashboard");
        }
      } catch {
        // User is not authenticated.
      }
    }

    checkAuthentication();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/adminAuth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          remember,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Invalid email or password");
      }

      window.location.href = "/admin/dashboard";
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

  return (
    <AuthShell
      title="Admin Portal"
      subtitle="Sign in to manage the platform"
      footer={
        <span>
          Trouble signing in?{" "}
          <Link
            href="mailto:support@platform.com"
            className="text-brand hover:underline"
          >
            Contact a super admin
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {inactivityNotice && (
          <div className="flex items-start gap-2.5 p-3 rounded-card bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
            <span>Your session expired due to 15 minutes of inactivity. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-card bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
            <span>{error}</span>
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-[12.5px] text-sky-900 mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@platform.com"
            autoComplete="email"
            className="w-full rounded-card border border-sky-900 px-3 py-2 text-[13.5px] text-ink placeholder:text-sky-900 outline-none focus:border-none"
            required
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[12.5px] text-sky-900 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-3.5 w-3.5 rounded-sm border-sky-900 bg-sky-100 accent-brand"
            />
            Remember me
          </label>
          <Link href="#" className="text-[12.5px] text-sky-900 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="text-[12.5px] text-bad bg-bad-soft rounded-card px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-card bg-sky-900 rounded-md px-3.5 py-2 text-[13px] font-medium text-white hover:bg-brand/90 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
