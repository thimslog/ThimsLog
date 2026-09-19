"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api-client";
import {
  User,
  Lock,
  ShieldCheck,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { useAdminPage } from "@/context/admin-page-context";
import { useAuth } from "@/context/admin-auth-context";
import { toast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const { setPageTitle } = useAdminPage();
  const { admin: authAdmin, refreshAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Profile Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setPageTitle({
      title: "Account Settings",
      subtitle: "Manage your profile details and security credentials",
    });
  }, [setPageTitle]);

  const { data: profileData, isLoading: loading } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: () =>
      apiGet<{ success: boolean; admin: any }>("/api/admin/profile"),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (profileData?.admin) {
      setFirstName(profileData.admin.firstName || "");
      setLastName(profileData.admin.lastName || "");
      setUserName(profileData.admin.userName || "");
      setEmail(profileData.admin.email || "");
      setRole(profileData.admin.role || "ADMIN");
    } else if (authAdmin) {
      setFirstName(authAdmin.firstName || "");
      setLastName(authAdmin.lastName || "");
      setUserName(authAdmin.userName || "");
      setEmail(authAdmin.email || "");
      setRole(authAdmin.role || "ADMIN");
    }
  }, [profileData, authAdmin]);

  const updateProfileMutation = useMutation({
    mutationFn: (body: any) =>
      apiMutate<{ success: boolean; message?: string }>(
        "/api/admin/profile",
        "PATCH",
        body
      ),
    onSuccess: async (data) => {
      toast.success(data.message || "Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "admin"] });
      await refreshAdmin();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error updating profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (body: any) =>
      apiMutate<{ success: boolean; message?: string }>(
        "/api/admin/profile",
        "PATCH",
        body
      ),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error changing password");
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    updateProfileMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userName: userName.trim() || undefined,
    });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  const savingProfile = updateProfileMutation.isPending;
  const savingPassword = changePasswordMutation.isPending;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin text-sky-600" size={24} />
          <span className="text-sm font-medium">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 p-6">
      {/* Profile Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-sky-700 via-sky-600 to-sky-800 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl font-bold border border-white/20">
            {firstName?.[0] || "A"}
            {lastName?.[0] || ""}
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {firstName} {lastName}
            </h2>
            <p className="text-xs text-sky-100 font-mono">@{userName || "admin"}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                {role.replaceAll("_", " ")}
              </span>
              <span className="text-xs text-sky-100">{email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Details Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Personal Information
              </h3>
              <p className="text-xs text-slate-400">
                Update your admin display name and handle
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="username"
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400">
                Email is tied to your admin authentication role and cannot be changed here.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Security &amp; Password
              </h3>
              <p className="text-xs text-slate-400">
                Update your login password
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {savingPassword ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
