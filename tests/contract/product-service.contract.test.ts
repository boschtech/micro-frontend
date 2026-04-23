// @vitest-environment node
import { describe, it, expect } from "vitest";
import { PactV4, MatchersV3 } from "@pact-foundation/pact";
import { productsApi } from "@/api/products";
import { serviceUrl } from "@/api/client";

const { string, integer, decimal, boolean, eachLike } = MatchersV3;

const provider = new PactV4({
  consumer: "micro-frontend",
  provider: "product-service",
  dir: "./pacts",
});

// ── Reusable response shapes ─────────────────────────────────

const PRODUCT_SHAPE = {
  id: string("prod-001"),
  name: string("Widget Alpha"),
  description: string("A premium widget for all your needs"),
  price: decimal(29.99),
  category: string("Widgets"),
  inStock: boolean(true),
};

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
  (serviceUrl as Record<string, string>).products = mockServer.url;
}

// ── Contract tests ───────────────────────────────────────────

describe("Product Service Contract", () => {
  it("GET /api/products – returns all products", async () => {
    await provider
      .addInteraction()
      .given("products exist")
      .uponReceiving("a request for all products")
      .withRequest("GET", "/api/products")
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(eachLike(PRODUCT_SHAPE));
      })
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const products = await productsApi.getAll();
        expect(products).toHaveLength(1);
        expect(products[0]).toHaveProperty("id");
        expect(products[0]).toHaveProperty("name");
        expect(products[0]).toHaveProperty("price");
        expect(products[0]).toHaveProperty("category");
        expect(products[0]).toHaveProperty("inStock");
      });
  });

  it("GET /api/products/:id – returns a single product", async () => {
    await provider
      .addInteraction()
      .given("product prod-001 exists")
      .uponReceiving("a request for product prod-001")
      .withRequest("GET", "/api/products/prod-001")
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(PRODUCT_SHAPE);
      })
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const product = await productsApi.getById("prod-001");
        expect(product.id).toBe("prod-001");
        expect(product.name).toBe("Widget Alpha");
        expect(product.price).toBe(29.99);
        expect(product.inStock).toBe(true);
      });
  });

  it("POST /api/products – creates a new product", async () => {
    const body = {
      name: "Widget Alpha",
      description: "A premium widget for all your needs",
      price: 29.99,
      category: "Widgets",
    };

    await provider
      .addInteraction()
      .given("the product service is available")
      .uponReceiving("a request to create a product")
      .withRequest("POST", "/api/products", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          name: string(body.name),
          description: string(body.description),
          price: decimal(body.price),
          category: string(body.category),
        });
      })
      .willRespondWith(201, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(PRODUCT_SHAPE);
      })
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const product = await productsApi.create(body);
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("inStock");
      });
  });

  it("PUT /api/products/:id – updates a product", async () => {
    const body = {
      name: "Widget Alpha Pro",
      description: "An upgraded premium widget",
      price: 39.99,
      category: "Widgets",
    };

    await provider
      .addInteraction()
      .given("product prod-001 exists")
      .uponReceiving("a request to update product prod-001")
      .withRequest("PUT", "/api/products/prod-001", (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          name: string(body.name),
          description: string(body.description),
          price: decimal(body.price),
          category: string(body.category),
        });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody(PRODUCT_SHAPE);
      })
      .executeTest(async (mockServer) => {
        const res = await fetch(`${mockServer.url}/api/products/prod-001`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        expect(res.status).toBe(200);
        const product = await res.json();
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("price");
      });
  });

  it("DELETE /api/products/:id – deletes a product", async () => {
    await provider
      .addInteraction()
      .given("product prod-001 exists")
      .uponReceiving("a request to delete product prod-001")
      .withRequest("DELETE", "/api/products/prod-001")
      .willRespondWith(204)
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const result = await productsApi.delete("prod-001");
        expect(result).toBeUndefined();
      });
  });

  it("GET /api/products/:id/orders – returns product orders", async () => {
    await provider
      .addInteraction()
      .given("product prod-001 has orders")
      .uponReceiving("a request for orders of product prod-001")
      .withRequest("GET", "/api/products/prod-001/orders")
      .willRespondWith(200, (builder) => {
        builder.headers({ "Content-Type": "application/json" });
        builder.jsonBody({
          productId: string("prod-001"),
          productName: string("Widget Alpha"),
          orderCount: integer(1),
          orders: eachLike(ORDER_SHAPE),
        });
      })
      .executeTest(async (mockServer) => {
        pointToProvider(mockServer);
        const result = await productsApi.getOrders("prod-001");
        expect(result.productId).toBe("prod-001");
        expect(result.productName).toBe("Widget Alpha");
        expect(result.orderCount).toBe(1);
        expect(result.orders).toHaveLength(1);
        expect(result.orders[0]).toHaveProperty("id");
        expect(result.orders[0]).toHaveProperty("status");
      });
  });

});
