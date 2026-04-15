import { vi } from "vitest";
import type { Product, Order } from "@/types";

// ── Mock Data ────────────────────────────────────────────────

export const mockProducts: Product[] = [
  {
    id: "prod-0001-abcd-efgh",
    name: "Widget Alpha",
    description: "A premium widget for all your needs",
    price: 29.99,
    category: "Widgets",
    inStock: true,
  },
  {
    id: "prod-0002-ijkl-mnop",
    name: "Gadget Beta",
    description: "The latest in gadget technology",
    price: 49.99,
    category: "Gadgets",
    inStock: true,
  },
  {
    id: "prod-0003-qrst-uvwx",
    name: "Gizmo Gamma",
    description: "An innovative gizmo design",
    price: 19.99,
    category: "Gizmos",
    inStock: false,
  },
];

export const mockOrders: Order[] = [
  {
    id: "ordr-0001-aaaa-bbbb",
    productId: "prod-0001-abcd-efgh",
    productName: "Widget Alpha",
    quantity: 2,
    totalPrice: 59.98,
    status: "CONFIRMED",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "ordr-0002-cccc-dddd",
    productId: "prod-0002-ijkl-mnop",
    productName: "Gadget Beta",
    quantity: 1,
    totalPrice: 49.99,
    status: "PENDING",
    createdAt: "2025-01-16T11:00:00Z",
  },
  {
    id: "ordr-0003-eeee-ffff",
    productId: "prod-0001-abcd-efgh",
    productName: "Widget Alpha",
    quantity: 3,
    totalPrice: 89.97,
    status: "CONFIRMED",
    createdAt: "2025-01-17T09:30:00Z",
  },
];

// ── Mock Server ──────────────────────────────────────────────

export interface MockServerOptions {
  products?: Product[];
  orders?: Order[];
  healthStatus?: "UP" | "DOWN";
  failHealth?: boolean;
  failProducts?: boolean;
  failOrders?: boolean;
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (body !== undefined ? JSON.stringify(body) : ""),
  } as Response;
}

export function setupMockServer(options?: MockServerOptions) {
  const products = [...(options?.products ?? mockProducts)];
  const orders = [...(options?.orders ?? mockOrders)];
  const healthStatus = options?.healthStatus ?? "UP";

  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = typeof input === "string" ? input : (input as Request).url;
    const method = init?.method ?? "GET";

    // ── Health ─────────────────────────────────────────────
    if (url.endsWith("/actuator/health")) {
      if (options?.failHealth) return jsonResponse("Service unavailable", 503);
      return jsonResponse({ status: healthStatus });
    }

    // ── Products ───────────────────────────────────────────
    if (url.includes("/api/products")) {
      if (options?.failProducts) return jsonResponse("Internal server error", 500);

      // POST /api/products
      if (url.endsWith("/api/products") && method === "POST") {
        const data = JSON.parse(init?.body as string);
        const created: Product = { id: "prod-new-0001-0001", ...data, inStock: true };
        products.push(created);
        return jsonResponse(created, 201);
      }

      // GET /api/products/:id/orders
      const ordersMatch = url.match(/\/api\/products\/([^/]+)\/orders$/);
      if (ordersMatch && method === "GET") {
        const pid = ordersMatch[1];
        const product = products.find((p) => p.id === pid);
        const pOrders = orders.filter((o) => o.productId === pid);
        return jsonResponse({
          productId: pid,
          productName: product?.name ?? "Unknown",
          orderCount: pOrders.length,
          orders: pOrders,
        });
      }

      // PUT /api/products/:id
      const putMatch = url.match(/\/api\/products\/([^/]+)$/);
      if (putMatch && method === "PUT") {
        const id = putMatch[1];
        const data = JSON.parse(init?.body as string);
        const idx = products.findIndex((p) => p.id === id);
        if (idx >= 0) {
          products[idx] = { ...products[idx], ...data };
          return jsonResponse(products[idx]);
        }
        return jsonResponse("Not found", 404);
      }

      // DELETE /api/products/:id
      const delMatch = url.match(/\/api\/products\/([^/]+)$/);
      if (delMatch && method === "DELETE") {
        const id = delMatch[1];
        const idx = products.findIndex((p) => p.id === id);
        if (idx >= 0) products.splice(idx, 1);
        return jsonResponse(undefined, 204);
      }

      // GET /api/products/:id
      const getMatch = url.match(/\/api\/products\/([^/]+)$/);
      if (getMatch && method === "GET") {
        const product = products.find((p) => p.id === getMatch[1]);
        return product ? jsonResponse(product) : jsonResponse("Not found", 404);
      }

      // GET /api/products
      if (url.endsWith("/api/products") && method === "GET") {
        return jsonResponse(products);
      }
    }

    // ── Orders ─────────────────────────────────────────────
    if (url.includes("/api/orders")) {
      if (options?.failOrders) return jsonResponse("Internal server error", 500);

      // POST /api/orders
      if (url.endsWith("/api/orders") && method === "POST") {
        const data = JSON.parse(init?.body as string);
        const product = products.find((p) => p.id === data.productId);
        const created: Order = {
          id: "ordr-new-0001-0001",
          productId: data.productId,
          productName: product?.name ?? "Unknown",
          quantity: data.quantity,
          totalPrice: (product?.price ?? 0) * data.quantity,
          status: "CONFIRMED",
          createdAt: new Date().toISOString(),
        };
        orders.push(created);
        return jsonResponse(created, 201);
      }

      // GET /api/orders/product/:productId
      const byProductMatch = url.match(/\/api\/orders\/product\/([^/]+)$/);
      if (byProductMatch && method === "GET") {
        return jsonResponse(orders.filter((o) => o.productId === byProductMatch[1]));
      }

      // GET /api/orders/:id
      const getMatch = url.match(/\/api\/orders\/([^/]+)$/);
      if (getMatch && method === "GET") {
        const order = orders.find((o) => o.id === getMatch[1]);
        return order ? jsonResponse(order) : jsonResponse("Not found", 404);
      }

      // GET /api/orders
      if (url.endsWith("/api/orders") && method === "GET") {
        return jsonResponse(orders);
      }
    }

    return jsonResponse("Not found", 404);
  });
}
