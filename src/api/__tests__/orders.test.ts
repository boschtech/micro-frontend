import { describe, it, expect, vi, beforeEach } from "vitest";
import { ordersApi } from "../orders";

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

describe("ordersApi", () => {
  it("getAll fetches /api/orders", async () => {
    const orders = [{ id: "1" }];
    mockFetch(orders);

    const result = await ordersApi.getAll();

    expect(result).toEqual(orders);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/orders",
      expect.any(Object),
    );
  });

  it("getById fetches /api/orders/:id", async () => {
    const order = { id: "1" };
    mockFetch(order);

    const result = await ordersApi.getById("1");

    expect(result).toEqual(order);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/orders/1",
      expect.any(Object),
    );
  });

  it("create posts to /api/orders", async () => {
    const order = { id: "1", productId: "p1", quantity: 2 };
    mockFetch(order);

    const result = await ordersApi.create({
      productId: "p1",
      quantity: 2,
    });

    expect(result).toEqual(order);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/orders", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ productId: "p1", quantity: 2 }),
    });
  });

  it("getByProductId fetches /api/orders/product/:id", async () => {
    const orders = [{ id: "1", productId: "p1" }];
    mockFetch(orders);

    const result = await ordersApi.getByProductId("p1");

    expect(result).toEqual(orders);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/orders/product/p1",
      expect.any(Object),
    );
  });

  it("health fetches /actuator/health", async () => {
    mockFetch({ status: "UP" });

    const result = await ordersApi.health();

    expect(result).toEqual({ status: "UP" });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/actuator/health",
      expect.any(Object),
    );
  });
});
