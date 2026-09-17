"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Lock,
  Camera,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "@/components/ui/toast";

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phoneNumber: "",
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [copiedUsername, setCopiedUsername] = useState(false);

  // Username cooldown & validation state
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [nextAllowedDate, setNextAllowedDate] = useState<string | null>(null);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<{
    available: boolean;
    isCurrent?: boolean;
    message?: string;
  } | null>(null);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch full profile telemetry including cooldown
  const fetchProfileMeta = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCanChangeUsername(data.user.canChangeUsername ?? true);
          setDaysRemaining(data.user.daysRemaining ?? 0);
          setNextAllowedDate(data.user.nextAllowedDate || null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile meta:", err);
    }
  };

  useEffect(() => {
    fetchProfileMeta();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });

      if (user.canChangeUsername !== undefined) {
        setCanChangeUsername(user.canChangeUsername);
        setDaysRemaining(user.daysRemaining ?? 0);
        setNextAllowedDate(user.nextAllowedDate || null);
      }
    }
  }, [user]);

  // Debounced username availability check
  useEffect(() => {
    const clean = profileData.userName.trim().replace(/^@/, "");
    if (!clean || clean === user?.userName) {
      setUsernameAvailability(null);
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/user/profile/check-username?username=${encodeURIComponent(clean)}`
        );
        const data = await res.json();
        setUsernameAvailability(data);
      } catch {
        setUsernameAvailability(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [profileData.userName, user?.userName]);

  const handleCopyUsername = () => {
    if (!user?.userName) return;
    navigator.clipboard.writeText(`@${user.userName}`);
    setCopiedUsername(true);
    toast.success(`Copied @${user.userName} to clipboard!`);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          userName: profileData.userName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      await refreshUser();
      await fetchProfileMeta();
      setProfileMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      setProfileMessage({
        type: "error",
        text: msg,
      });
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match",
      });
      setIsSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setPasswordMessage({
        type: "success",
        text: "Password changed successfully!",
      });
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err?.message || "Something went wrong",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const formatAllowedDate = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-2 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your profile identity, username, and account credentials
        </p>
      </div>

      {/* Main Grid: Left Tabs & Right Content Card */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Vertical Tabs */}
        <div className="w-full md:w-56 shrink-0 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setProfileMessage(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "profile"
                ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-l-4 border-sky-600 dark:border-sky-400 rounded-r-xl font-semibold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border-l-4 border-transparent rounded-xl"
            }`}
          >
            <User
              size={18}
              className={
                activeTab === "profile"
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-slate-400 dark:text-slate-500"
              }
            />
            <span>Profile Settings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setPasswordMessage(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "password"
                ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-l-4 border-sky-600 dark:border-sky-400 rounded-r-xl font-semibold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border-l-4 border-transparent rounded-xl"
            }`}
          >
            <Lock
              size={18}
              className={
                activeTab === "password"
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-slate-400 dark:text-slate-500"
              }
            />
            <span>Password</span>
          </button>
        </div>

        {/* Right Content Card */}
        <div className="flex-1 w-full bg-white dark:bg-white/[0.04] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm p-6 sm:p-8 transition-colors">
          {activeTab === "profile" ? (
            <div>
              {/* Avatar & User Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-sky-50 dark:bg-sky-500/10 border-2 border-slate-200 dark:border-white/10 flex items-center justify-center">
                      <Image
                        src="/male.jpg"
                        alt={`${user?.firstName || "User"} ${user?.lastName || ""}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                    <button
                      type="button"
                      title="Change profile picture"
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-sky-600 dark:bg-sky-400 text-white dark:text-slate-950 shadow-md border-2 border-white dark:border-slate-900 hover:bg-sky-700 transition-colors cursor-pointer"
                    >
                      <Camera size={13} />
                    </button>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {user?.firstName || profileData.firstName}{" "}
                      {user?.lastName || profileData.lastName}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {user?.email || profileData.email}
                    </p>
                  </div>
                </div>

                {/* Username Quick Copy Badge */}
                {user?.userName && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200/80 dark:border-sky-500/20">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-700 dark:text-sky-300 block">
                        Your Username
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        @{user.userName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyUsername}
                      className="ml-2 inline-flex items-center gap-1.5 bg-white dark:bg-white/10 hover:bg-sky-100 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors cursor-pointer shadow-2xs"
                      title="Copy username"
                    >
                      {copiedUsername ? (
                        <>
                          <Check size={13} className="text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-b border-slate-100 dark:border-white/5 my-6" />

              {/* Personal Details Section */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Personal Details
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your identity details. Username edits are permitted once every 3 months.
                </p>
              </div>

              {/* Alerts */}
              {profileMessage && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                    profileMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                      : "bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <Check size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
                      placeholder="First Name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
                      placeholder="Last Name"
                    />
                  </div>

                  {/* Username (with 3-month rate limit & uniqueness check) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Username (@)
                      </label>
                      {!canChangeUsername ? (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Lock size={12} />
                          Locked (1 change per 3 months)
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles size={12} />
                          Editable
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        disabled={!canChangeUsername}
                        value={profileData.userName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            userName: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ""),
                          })
                        }
                        className={`w-full pl-8 pr-10 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                          !canChangeUsername
                            ? "bg-slate-100/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
                        }`}
                        placeholder="your_unique_username"
                      />

                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {checkingUsername && (
                          <Loader2 size={16} className="animate-spin text-sky-500" />
                        )}
                        {!checkingUsername && usernameAvailability && (
                          usernameAvailability.available ? (
                            <Check size={16} className="text-emerald-500" />
                          ) : (
                            <AlertCircle size={16} className="text-rose-500" />
                          )
                        )}
                      </div>
                    </div>

                    {/* Username helper / status */}
                    <div className="mt-2 space-y-1">
                      {usernameAvailability && !checkingUsername && (
                        <p
                          className={`text-xs font-semibold ${
                            usernameAvailability.available
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {usernameAvailability.message}
                        </p>
                      )}

                      {!canChangeUsername && nextAllowedDate && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <Clock size={15} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold">
                              Username locked for 3 months
                            </p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                              You can change your username again in{" "}
                              <strong>{daysRemaining} day(s)</strong> on{" "}
                              <strong>{formatAllowedDate(nextAllowedDate)}</strong>.
                            </p>
                          </div>
                        </div>
                      )}

                      {canChangeUsername && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          ℹ️ You can change your username once every 3 months. Choose wisely, as it will be locked after saving.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      placeholder="Email address"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isSavingProfile ||
                    (Boolean(usernameAvailability) && !usernameAvailability?.available)
                  }
                  className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm hover:shadow-glow transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingProfile && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  <span>Save Profile</span>
                </button>
              </form>
            </div>
          ) : (
            <div>
              {/* Password Section */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Password &amp; Security
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your password to keep your account safe and secure
                </p>
              </div>

              <div className="border-b border-slate-100 dark:border-white/5 my-6" />

              {/* Password Alerts */}
              {passwordMessage && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                      : "bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <Check size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              {/* Password Form */}
              <form onSubmit={handlePasswordSubmit} className="max-w-xl">
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
                      placeholder="Enter new password (min. 6 chars)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm hover:shadow-glow transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingPassword && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
