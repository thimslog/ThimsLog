const BASE_URL = "https://api.paymonetra.com/v1";
const SECRET_KEY =
  process.env.NODE_ENV === "development"
    ? process.env.PAYMONETRA_SECRET_TEST_KEY
    : process.env.PAYMONETRA_SECRET_LIVE_KEY;

async function paymonetraRequest(path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `Paymonetra ${path} failed: ${res.status} ${JSON.stringify(error)}`,
    );
  }
  return res.json();
}

export const createPayment = (params: {
  amount: number;
  reference: string; // OUR order id
  customerReference: string; // wallet.paymonetraCustomer
  customerName: string;
  description?: string;
}) =>
  paymonetraRequest("/payments", {
    amount: params.amount,
    reference: params.reference,
    customer_reference: params.customerReference,
    customer_name: params.customerName,
    description: params.description,
  });

export const getPayment = (paymonetraReference: string) =>
  paymonetraRequest(`/payments/${paymonetraReference}`);
