"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, Lock, Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
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

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      await refreshUser();
      setProfileMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: (err as Error).message || "Something went wrong",
      });
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
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: (err as Error).message || "Something went wrong",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-2">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Account Settings
        </h1>
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
                activeTab === "profile" ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"
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
                activeTab === "password" ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"
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

              {/* Divider */}
              <div className="border-b border-slate-100 dark:border-white/5 my-6" />

              {/* Personal Details Section */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Personal Details
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Edit your personal details and save from here
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

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Email
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
                  disabled={isSavingProfile}
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
