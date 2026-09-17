const BASE_URL = "https://api.paymonetra.com/v1";

function getSecretKey(): string {
  if (process.env.NODE_ENV === "development") {
    return (
      process.env.PAYMONETRA_SECRET_TEST_KEY ||
      process.env.PAYMONETRA_SECRET_KEY ||
      process.env.PAYMONETRA_SECRET_LIVE_KEY ||
      ""
    );
  }
  return (
    process.env.PAYMONETRA_SECRET_LIVE_KEY ||
    process.env.PAYMONETRA_SECRET_KEY ||
    process.env.PAYMONETRA_SECRET_TEST_KEY ||
    ""
  );
}

async function paymonetraRequest(path: string, body?: Record<string, unknown>) {
  const secretKey = getSecretKey();
  if (!secretKey) {
    throw new Error(
      "Paymonetra API key is not configured. Please set PAYMONETRA_SECRET_LIVE_KEY or PAYMONETRA_SECRET_TEST_KEY in environment variables."
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      errorData?.message ||
      `Paymonetra ${path} failed with status ${res.status}`;
    const err = new Error(message);
    (err as any).status = res.status;
    (err as any).data = errorData;
    throw err;
  }
  return res.json();
}

/**
 * Exact Gross-Up formula for Paymonetra (1% + ₦100, waived under ₦2,500, capped at ₦2,000).
 * Guarantees the merchant receives EXACTLY 100% of the requested net amount after Paymonetra deducts its fee.
 */
export function calculateGrossAmount(netAmount: number): {
  grossAmount: number;
  fee: number;
} {
  const amount = Number(netAmount);
  if (!amount || amount <= 0) return { grossAmount: 0, fee: 0 };

  let grossAmount = 0;

  if (amount < 2500) {
    // Under ₦2,500: fee is 1% with ₦100 waived -> G = N / 0.99
    grossAmount = Math.ceil((amount / 0.99) * 100) / 100;
  } else {
    // Over ₦2,500: fee is 1% + ₦100 -> G = (N + 100) / 0.99
    const uncappedGross = (amount + 100) / 0.99;
    const uncappedFee = uncappedGross * 0.01 + 100;

    if (uncappedFee >= 2000) {
      // Fee reaches the ₦2,000 maximum cap
      grossAmount = amount + 2000;
    } else {
      grossAmount = Math.ceil(uncappedGross * 100) / 100;
    }
  }

  const fee = Math.round((grossAmount - amount) * 100) / 100;

  return {
    grossAmount,
    fee,
  };
}

export const createPayment = async (params: {
  amount: number;
  reference: string; // OUR order id
  customerReference?: string; // wallet.paymonetraCustomer
  customerName?: string;
  description?: string;
}) => {
  const payload: Record<string, unknown> = {
    amount: params.amount,
    reference: params.reference,
  };
  if (params.customerName) payload.customer_name = params.customerName;
  if (params.description) payload.description = params.description;

  if (params.customerReference) {
    try {
      return await paymonetraRequest("/payments", {
        ...payload,
        customer_reference: params.customerReference,
      });
    } catch (err: any) {
      console.warn(
        "Paymonetra createPayment with customer_reference failed, falling back to collection account:",
        err?.message || err
      );
      // Fall back without customer_reference so checkout uses merchant collection account
      return await paymonetraRequest("/payments", payload);
    }
  }

  return paymonetraRequest("/payments", payload);
};

export const getPayment = (paymonetraReference: string) =>
  paymonetraRequest(`/payments/${paymonetraReference}`);

export const createVirtualAccount = async (params: {
  customerReference: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  bvn?: string;
}) => {
  const payload: Record<string, unknown> = {
    customer_reference: params.customerReference,
    customer_name: params.customerName,
  };
  if (params.customerEmail) payload.customer_email = params.customerEmail;
  if (params.customerPhone) payload.customer_phone = params.customerPhone;
  if (params.bvn) payload.bvn = params.bvn;

  // Try standard virtual account endpoints supported by Paymonetra
  try {
    return await paymonetraRequest("/customer_accounts", payload);
  } catch (err: any) {
    if (err?.status === 404) {
      try {
        return await paymonetraRequest("/customer_accounts", payload);
      } catch (err2: any) {
        if (err2?.status === 404) {
          return await paymonetraRequest("/customer_accounts", payload);
        }
        throw err2;
      }
    }
    throw err;
  }
};

export const getVirtualAccount = (accountReference: string) =>
  paymonetraRequest(`/customer_accounts/${accountReference}`);
