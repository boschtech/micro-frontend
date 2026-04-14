import { describe, it, expect, vi, beforeEach } from "vitest";
import { productsApi } from "../products";

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

function mockFetchVoid() {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok: true,
    status: 204,
  } as Response);
}

describe("productsApi", () => {
  it("getAll fetches /api/products", async () => {
    const products = [{ id: "1", name: "Test" }];
    mockFetch(products);

    const result = await productsApi.getAll();

    expect(result).toEqual(products);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/products",
      expect.any(Object),
    );
  });

  it("getById fetches /api/products/:id", async () => {
    const product = { id: "1", name: "Test" };
    mockFetch(product);

    const result = await productsApi.getById("1");

    expect(result).toEqual(product);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/products/1",
      expect.any(Object),
    );
  });

  it("create posts to /api/products", async () => {
    const product = { id: "1", name: "New" };
    mockFetch(product);

    const result = await productsApi.create({
      name: "New",
      description: "Desc",
      price: 10,
      category: "Cat",
    });

    expect(result).toEqual(product);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/products", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        name: "New",
        description: "Desc",
        price: 10,
        category: "Cat",
      }),
    });
  });

  it("update puts to /api/products/:id", async () => {
    const product = { id: "1", name: "Updated" };
    mockFetch(product);

    const result = await productsApi.update("1", {
      name: "Updated",
      description: "Desc",
      price: 20,
      category: "Cat",
    });

    expect(result).toEqual(product);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/products/1", {
      headers: { "Content-Type": "application/json" },
      method: "PUT",
      body: expect.any(String),
    });
  });

  it("delete sends DELETE to /api/products/:id", async () => {
    mockFetchVoid();

    const result = await productsApi.delete("1");

    expect(result).toBeUndefined();
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/products/1", {
      headers: { "Content-Type": "application/json" },
      method: "DELETE",
    });
  });

  it("getOrders fetches /api/products/:id/orders", async () => {
    const data = { productId: "1", orders: [] };
    mockFetch(data);

    const result = await productsApi.getOrders("1");

    expect(result).toEqual(data);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/products/1/orders",
      expect.any(Object),
    );
  });

  it("health fetches /actuator/health", async () => {
    mockFetch({ status: "UP" });

    const result = await productsApi.health();

    expect(result).toEqual({ status: "UP" });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/actuator/health",
      expect.any(Object),
    );
  });
});
