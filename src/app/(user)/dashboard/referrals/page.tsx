"use client";

import React, { useEffect, useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  ReferralData,
  ReferralHeroCard,
  ReferrerClaimCard,
  ReferralStatsCards,
  ReferralHowItWorks,
  ReferralActivityTabs,
} from "@/components/dashboard/referrals";

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "rewards">("friends");

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/referrals");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        toast.error(json.message || "Failed to load referral details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading referrals");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReferrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCode.trim()) return;
    try {
      setClaiming(true);
      const res = await fetch("/api/user/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: claimCode.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to link referral code");
      }
      toast.success(json.message || "Referrer linked successfully!");
      setClaimCode("");
      fetchReferrals();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const copyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Referral link copied to clipboard!");
  };

  const copyCode = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success("Referral code copied to clipboard!");
  };

  const shareToWhatsApp = () => {
    if (!data?.referralLink) return;
    const text = `Hey! Buy premium verified social media accounts, aged logs, and developer accounts on ThimsLog. Sign up with my link:\n${data.referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToTelegram = () => {
    if (!data?.referralLink) return;
    const text = `Buy high quality aged social media accounts on ThimsLog:`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(data.referralLink)}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-2 font-sans space-y-6">
      {/* 1. Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Gift className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Referrals & Affiliate Rewards
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Invite friends, media buyers, and agencies. Earn 1% instant wallet cash on every purchase above ₦20,000 they make.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-sky-600 dark:text-sky-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading your referral hub...</p>
        </div>
      ) : (
        <>
          {/* 2. Hero Invite Card */}
          <ReferralHeroCard
            referralLink={data?.referralLink || ""}
            referralCode={data?.referralCode || ""}
            copiedLink={copiedLink}
            copiedCode={copiedCode}
            onCopyLink={copyLink}
            onCopyCode={copyCode}
            onShareWhatsApp={shareToWhatsApp}
            onShareTelegram={shareToTelegram}
          />

          {/* 3. Referrer Info / 1-Time Claim Input */}
          <ReferrerClaimCard
            referredBy={data?.referredBy}
            claimCode={claimCode}
            claiming={claiming}
            onClaimCodeChange={setClaimCode}
            onSubmitClaim={handleClaimReferrer}
          />

          {/* 4. KPI Metrics */}
          <ReferralStatsCards
            metrics={
              data?.metrics || {
                totalReferred: 0,
                totalEarnings: 0,
                totalRewardsCount: 0,
              }
            }
            commissionRatePercent={data?.commissionRatePercent || "1%"}
          />

          {/* 5. How it works 3 Steps */}
          <ReferralHowItWorks />

          {/* 6. Tabs: Referred Friends vs Commission Payouts History */}
          <ReferralActivityTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            referredUsers={data?.referredUsers || []}
            rewards={data?.rewards || []}
          />
        </>
      )}
    </div>
  );
}
