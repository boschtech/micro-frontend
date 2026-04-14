import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useOrders,
  useOrder,
  useOrdersByProduct,
  useCreateOrder,
} from "../useOrders";

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(data: unknown) {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
  } as Response);
}

describe("useOrders", () => {
  it("fetches all orders", async () => {
    mockFetch([{ id: "1" }]);
    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "1" }]);
  });
});

describe("useOrder", () => {
  it("fetches an order by id", async () => {
    mockFetch({ id: "1", status: "CONFIRMED" });
    const { result } = renderHook(() => useOrder("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "1", status: "CONFIRMED" });
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useOrder(""), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });
});

describe("useOrdersByProduct", () => {
  it("fetches orders by product id", async () => {
    mockFetch([{ id: "1", productId: "p1" }]);
    const { result } = renderHook(() => useOrdersByProduct("p1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "1", productId: "p1" }]);
  });

  it("does not fetch when productId is empty", () => {
    const { result } = renderHook(() => useOrdersByProduct(""), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });
});

describe("useCreateOrder", () => {
  it("creates an order and invalidates cache", async () => {
    mockFetch({ id: "new", productId: "p1", quantity: 2 });
    const { result } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ productId: "p1", quantity: 2 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      id: "new",
      productId: "p1",
      quantity: 2,
    });
  });
});
