export interface ReferredUser {
  id: string;
  name: string;
  username: string;
  emailMasked: string;
  joinedAt: string;
}

export interface ReferralReward {
  id: string;
  amount: number;
  sourceType: string;
  sourceAmount: number;
  refereeName: string;
  status: string;
  createdAt: string;
}

export interface ReferralMetrics {
  totalReferred: number;
  totalEarnings: number;
  totalRewardsCount: number;
}

export interface ReferralData {
  referralCode: string;
  referralLink: string;
  referredBy?: { id: string; name: string; username: string } | null;
  commissionRate: number;
  commissionRatePercent: string;
  minPurchaseThreshold?: number;
  metrics: ReferralMetrics;
  referredUsers: ReferredUser[];
  rewards: ReferralReward[];
}

export const formatMoney = (val: number): string =>
  `₦${Number(val || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
