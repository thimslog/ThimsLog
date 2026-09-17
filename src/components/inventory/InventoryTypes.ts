export type InventoryAccountStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "SOLD"
  | "SUSPENDED"
  | "DISABLED";

export interface InventoryAccount {
  id: string;
  accountTypeId: string;
  name?: string | null;
  username: string | null;
  email: string | null;
  url: string | null;
  status: InventoryAccountStatus;
  country: string | null;
  followers: number | null;
  notes: string | null; // Instructions before buying
  loginInstructions?: string | null; // Instructions on how to login
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryAccountInput {
  accountTypeId: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  url?: string | null;
  country?: string | null;
  followers?: number | null;
  status?: InventoryAccountStatus;
  notes?: string | null;
  loginInstructions?: string | null;
}


export type UpdateInventoryAccountInput = Partial<CreateInventoryAccountInput>;

export interface AccountType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountTypeInput {
  name: string;
  description?: string | null;
  price: number;
  categoryId: string;
}

export type UpdateAccountTypeInput = Partial<CreateAccountTypeInput>;
