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
    apiRequest("/categories"),

  create: (data: Record<string, unknown>) =>
    apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Record<string, unknown>
  ) =>
    apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiRequest(`/categories/${id}`, {
      method: "DELETE",
    }),
};

export const AccountTypeAPI = {
  list: (categoryId: string) =>
    apiRequest<AccountType[]>(
      `/account-types?categoryId=${encodeURIComponent(categoryId)}`
    ),

  create: (data: Record<string, unknown>) =>
    apiRequest<AccountType>("/account-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Record<string, unknown>
  ) =>
    apiRequest<AccountType>(`/account-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiRequest<void>(`/account-types/${id}`, {
      method: "DELETE",
    }),
};

export const AccountAPI = {
  list: (accountTypeId: string) =>
    apiRequest<InventoryAccount[]>(
      `/accounts?accountTypeId=${encodeURIComponent(accountTypeId)}`
    ),

  create: (data: Record<string, unknown>) =>
    apiRequest<InventoryAccount>("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Record<string, unknown>
  ) =>
    apiRequest<InventoryAccount>(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiRequest<void>(`/accounts/${id}`, {
      method: "DELETE",
    }),
};