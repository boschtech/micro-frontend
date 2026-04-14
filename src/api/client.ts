const PRODUCT_SERVICE =
  import.meta.env.VITE_PRODUCT_SERVICE_URL ?? "";
const ORDER_SERVICE =
  import.meta.env.VITE_ORDER_SERVICE_URL ?? "";

export const serviceUrl = {
  products: PRODUCT_SERVICE,
  orders: ORDER_SERVICE,
} as const;

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export { ApiError };

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
