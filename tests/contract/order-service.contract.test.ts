// @vitest-environment node
import { describe, it, expect } from "vitest";
import { PactV4, MatchersV3 } from "@pact-foundation/pact";
import { ordersApi } from "@/api/orders";
import { serviceUrl } from "@/api/client";

const { string, integer, decimal, eachLike } = MatchersV3;

const provider = new PactV4({
  consumer: "micro-frontend",
  provider: "order-service",
  dir: "./pacts",
});

// ── Reusable response shape ──────────────────────────────────

const ORDER_SHAPE = {
  id: string("order-001"),
  productId: string("prod-001"),
  productName: string("Widget Alpha"),
  quantity: integer(2),
  totalPrice: decimal(59.98),
  status: string("CONFIRMED"),
  createdAt: string("2025-01-15T10:00:00Z"),
};

// ── Helpers ──────────────────────────────────────────────────

function pointToProvider(mockServer: { url: string }) {
  (serviceUrl as Record<string, string>).orders = mockServer.url;
}

// ── Contract tests ───────────────────────────────────────────

describe("Order Service Contract", () => {
  it("GET /api/orders – returns all orders", async () => {
    await provider
      .addInteraction()
      .given("orders exist")
      .uponReceiving("a request for all orders")
      .withRequest("GET", "/api/orders", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(eachLike(ORDER_SHAPE));
      })
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const orders = await ordersApi.getAll();
        expect(orders).toHaveLength(1);
        expect(orders[0]).toHaveProperty("id");
        expect(orders[0]).toHaveProperty("productId");
        expect(orders[0]).toHaveProperty("productName");
        expect(orders[0]).toHaveProperty("quantity");
        expect(orders[0]).toHaveProperty("totalPrice");
        expect(orders[0]).toHaveProperty("status");
        expect(orders[0]).toHaveProperty("createdAt");
      });
  });

  it("GET /api/orders/:id – returns a single order", async () => {
    await provider
      .addInteraction()
      .given("order order-001 exists")
      .uponReceiving("a request for order order-001")
      .withRequest("GET", "/api/orders/order-001", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(ORDER_SHAPE);
      })
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const order = await ordersApi.getById("order-001");
        expect(order.id).toBe("order-001");
        expect(order.productId).toBe("prod-001");
        expect(order.quantity).toBe(2);
        expect(order.totalPrice).toBe(59.98);
        expect(order.status).toBe("CONFIRMED");
      });
  });

  it("POST /api/orders – creates a new order", async () => {
    const body = { productId: "prod-001", quantity: 2 };

    await provider
      .addInteraction()
      .given("product prod-001 exists and is in stock")
      .uponReceiving("a request to create an order")
      .withRequest("POST", "/api/orders", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          productId: string(body.productId),
          quantity: integer(body.quantity),
        });
      })
      .willRespondWith(201, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(ORDER_SHAPE);
      })
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const order = await ordersApi.create(body);
        expect(order).toHaveProperty("id");
        expect(order).toHaveProperty("productId");
        expect(order).toHaveProperty("status");
        expect(order).toHaveProperty("totalPrice");
      });
  });

  it("GET /api/orders/product/:productId – returns orders by product", async () => {
    await provider
      .addInteraction()
      .given("orders exist for product prod-001")
      .uponReceiving("a request for orders of product prod-001")
      .withRequest("GET", "/api/orders/product/prod-001", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(eachLike(ORDER_SHAPE));
      })
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const orders = await ordersApi.getByProductId("prod-001");
        expect(orders).toHaveLength(1);
        expect(orders[0]!.productId).toBe("prod-001");
      });
  });

  it("GET /actuator/health – returns health status", async () => {
    await provider
      .addInteraction()
      .given("the order service is healthy")
      .uponReceiving("a health check request to order service")
      .withRequest("GET", "/actuator/health", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({ status: string("UP") });
      })
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const health = await ordersApi.health();
        expect(health.status).toBe("UP");
      });
  });
});
