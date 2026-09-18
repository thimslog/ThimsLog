export interface WalletInfo {
  balance: string | number;
  currency: string;
}

export interface UserApiRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  referralCode?: string;
  referredBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    userName: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
  wallet?: WalletInfo | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: UserApiRecord[];
    pagination: Pagination;
  };
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  referralCode?: string;
  referredBy?: {
    id: string;
    name: string;
    username: string;
  } | null;
  balance: number;
  currency: string;
  joinedAt: string;
  lastActive: string;
}
