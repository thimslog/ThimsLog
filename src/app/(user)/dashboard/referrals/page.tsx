"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { apiGet, apiMutate } from "@/lib/api-client";
import {
  ReferralData,
  ReferralHeroCard,
  ReferrerClaimCard,
  ReferralStatsCards,
  ReferralHowItWorks,
  ReferralActivityTabs,
} from "@/components/dashboard/referrals";

export default function ReferralsPage() {
  const queryClient = useQueryClient();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "rewards">("friends");

  // 1. React Query for Referrals Hub (2 mins cache)
  const { data: referralsResponse, isLoading: loading } = useQuery({
    queryKey: ["user", "referrals"],
    queryFn: () => apiGet<{ success: boolean; data: ReferralData }>("/api/user/referrals"),
    staleTime: 2 * 60 * 1000,
  });

  const data = referralsResponse?.data || null;

  // 2. React Query Mutation for Claiming / Linking Referrer
  const claimMutation = useMutation({
    mutationFn: (referralCode: string) =>
      apiMutate<{ success: boolean; message?: string }>("/api/user/referrals", {
        method: "POST",
        body: { referralCode },
      }),
    onSuccess: (res) => {
      toast.success(res.message || "Referrer linked successfully!");
      setClaimCode("");
      queryClient.invalidateQueries({ queryKey: ["user", "referrals"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "An error occurred");
    },
  });

  const handleClaimReferrer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCode.trim()) return;
    claimMutation.mutate(claimCode.trim());
  };

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
            claiming={claimMutation.isPending}
            onClaimCodeChange={setClaimCode}
            onSubmitClaim={handleClaimReferrer}
          />

          {/* 4. KPI Performance Stats */}
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

          {/* 5. How It Works Guide */}
          <ReferralHowItWorks />

          {/* 6. Referral Activity History Tabs */}
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
