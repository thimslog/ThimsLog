import { AccountType, InventoryAccount } from "./InventoryTypes";

const BASE_URL = "/api";

interface ApiRequestOptions extends RequestInit {
  // Add custom options here later if needed
}

const apiRequest = async <T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T | null> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    throw new Error(
      body.message || `Request failed (${res.status})`
    );
  }

  if (res.status === 204) {
    return null;
  }

  // return res.json();
  return (await res.json()) as T;
};

export const CategoryAPI = {
  list: () =>
    apiRequest("/inventory/categories"),

  create: (data: Record<string, unknown>) =>
    apiRequest("/inventory/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Record<string, unknown>
  ) =>
    apiRequest(`/inventory/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiRequest(`/inventory/categories/${id}`, {
      method: "DELETE",
    }),
};

export const AccountTypeAPI = {
  list: (categoryId: string) =>
    apiRequest<AccountType[]>(
      `/inventory/account-types?categoryId=${encodeURIComponent(categoryId)}`
    ),

  create: (data: Record<string, unknown>) =>
    apiRequest<AccountType>("/inventory/account-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Record<string, unknown>
  ) =>
    apiRequest<AccountType>(`/inventory/account-types/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiRequest<void>(`/inventory/account-types/${id}`, {
      method: "DELETE",
    }),
};

export const AccountAPI = {
  list: (accountTypeId: string) =>
    apiRequest<InventoryAccount[]>(
      `/inventory/accounts?accountTypeId=${encodeURIComponent(accountTypeId)}`
    ),

  create: (data: Record<string, unknown>) =>
    apiRequest<InventoryAccount>("/inventory/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Record<string, unknown>
  ) =>
    apiRequest<InventoryAccount>(`/inventory/accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiRequest<void>(`/inventory/accounts/${id}`, {
      method: "DELETE",
    }),
};