"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  Gift,
} from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/context/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser, setUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = getPasswordStrength(password);

  useEffect(() => {
    const refParam = searchParams.get("ref") || searchParams.get("code");
    if (refParam) {
      setReferralCode(refParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
          userName,
          password,
          confirmPassword,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create account");
        setLoading(false);
        return;
      }

      if (data.user) {
        setUser(data.user);
      }
      await refreshUser();

      router.replace("/dashboard");
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join 18,000+ traders buying and selling with escrow protection."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              First name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Last name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Your last name"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="your phone number"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="your username"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < strength.score ? strength.color : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 w-20 text-right font-medium">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < strength.score ? strength.color : "bg-slate-200 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 w-20 text-right font-medium">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Referral Code (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Referral Code <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <Gift className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="e.g. username or referral code"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs font-mono text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 font-semibold dark:hover:bg-sky-300 transition-all shadow-sm hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-sky-600 dark:text-sky-400 font-semibold hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Too short", color: "bg-rose-500" },
    { label: "Weak", color: "bg-rose-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-sky-500" },
    { label: "Strong", color: "bg-emerald-500" },
  ];

  return { score, ...levels[score] };
}
