export interface WalletData {
  id?: string;
  balance: number;
  currency: string;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  virtualAccountReference: string | null;
}

export const AMOUNT_PRESETS = [1000, 2500, 5000, 10000, 20000, 50000];

export const formatMoney = (val: number | string | null | undefined): string =>
  `₦${Number(val || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
