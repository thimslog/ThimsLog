/**
 * Centralized API fetchers for React Query
 */

// Generic GET helper
export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || (data && data.success === false)) {
    throw new Error(data?.message || "Failed to fetch data");
  }
  return data;
}

export type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiMutateOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
}

// Function overloads to support all calling styles in TypeScript:
export function apiMutate<T>(url: string, options?: ApiMutateOptions): Promise<T>;
export function apiMutate<T>(url: string, method: HttpMethod, body?: any): Promise<T>;
export function apiMutate<T>(url: string, body: any, method?: HttpMethod): Promise<T>;
export function apiMutate<T>(url: string, arg1?: any, arg2?: any): Promise<T>;

// Implementation
export async function apiMutate<T>(
  url: string,
  arg1?: any,
  arg2?: any
): Promise<T> {
  let method: HttpMethod = "POST";
  let body: any = undefined;
  let headers: Record<string, string> = {};

  const httpMethods = ["POST", "PUT", "PATCH", "DELETE"];

  if (typeof arg1 === "string" && httpMethods.includes(arg1.toUpperCase())) {
    // Signature: apiMutate(url, "PATCH", body) or apiMutate(url, "DELETE")
    method = arg1.toUpperCase() as HttpMethod;
    body = arg2;
  } else if (typeof arg2 === "string" && httpMethods.includes(arg2.toUpperCase())) {
    // Signature: apiMutate(url, body, "PUT")
    body = arg1;
    method = arg2.toUpperCase() as HttpMethod;
  } else if (
    arg1 &&
    typeof arg1 === "object" &&
    ("method" in arg1 || "body" in arg1 || "headers" in arg1)
  ) {
    // Signature: apiMutate(url, { method, body, headers })
    method = arg1.method || "POST";
    body = arg1.body;
    headers = arg1.headers || {};
  } else {
    // Signature: apiMutate(url, body) (defaults to POST)
    body = arg1;
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data && data.success === false)) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }
  return data;
}
