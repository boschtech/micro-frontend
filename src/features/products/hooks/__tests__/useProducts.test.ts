import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useProducts,
  useProduct,
  useProductOrders,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../useProducts";

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

function mockFetch(data: unknown, status = 200) {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok: true,
    status,
    json: async () => data,
  } as Response);
}

describe("useProducts", () => {
  it("fetches all products", async () => {
    mockFetch([{ id: "1" }]);
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "1" }]);
  });
});

describe("useProduct", () => {
  it("fetches a product by id", async () => {
    mockFetch({ id: "1", name: "Test" });
    const { result } = renderHook(() => useProduct("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "1", name: "Test" });
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useProduct(""), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });
});

describe("useProductOrders", () => {
  it("fetches orders for a product", async () => {
    mockFetch({ productId: "1", orders: [] });
    const { result } = renderHook(() => useProductOrders("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ productId: "1", orders: [] });
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useProductOrders(""), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });
});

describe("useCreateProduct", () => {
  it("creates a product and invalidates cache", async () => {
    mockFetch({ id: "new", name: "Created" });
    const { result } = renderHook(() => useCreateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: "Created",
      description: "d",
      price: 10,
      category: "c",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "new", name: "Created" });
  });
});

describe("useUpdateProduct", () => {
  it("updates a product and invalidates cache", async () => {
    mockFetch({ id: "1", name: "Updated" });
    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: "1",
      data: { name: "Updated", description: "d", price: 20, category: "c" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "1", name: "Updated" });
  });
});

describe("useDeleteProduct", () => {
  it("deletes a product and invalidates cache", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    const { result } = renderHook(() => useDeleteProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
