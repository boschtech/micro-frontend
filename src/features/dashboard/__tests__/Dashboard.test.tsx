import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../../tests/test-utils";
import { Dashboard } from "../Dashboard";

const mockProducts = [
  { id: "p1", name: "Keyboard", price: 79.99, category: "Electronics", inStock: true, description: "" },
  { id: "p2", name: "Mouse", price: 29.99, category: "Electronics", inStock: false, description: "" },
];

const mockOrders = [
  {
    id: "o1",
    productId: "p1",
    productName: "Keyboard",
    quantity: 2,
    totalPrice: 159.98,
    status: "CONFIRMED",
    createdAt: "2026-04-14T10:00:00",
  },
  {
    id: "o2",
    productId: "p1",
    productName: "Keyboard",
    quantity: 1,
    totalPrice: 79.99,
    status: "PENDING",
    createdAt: "2026-04-14T11:00:00",
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

function setupMocks(opts?: {
  healthUp?: boolean;
  healthError?: boolean;
}) {
  const { healthUp = true, healthError = false } = opts ?? {};
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    const urlStr = typeof url === "string" ? url : url.toString();

    if (urlStr.includes("/actuator/health")) {
      if (healthError) throw new Error("Connection refused");
      return {
        ok: true,
        status: 200,
        json: async () => ({ status: healthUp ? "UP" : "DOWN" }),
      } as Response;
    }
    if (urlStr.includes("/api/products")) {
      return {
        ok: true,
        status: 200,
        json: async () => mockProducts,
      } as Response;
    }
    if (urlStr.includes("/api/orders")) {
      return {
        ok: true,
        status: 200,
        json: async () => mockOrders,
      } as Response;
    }
    return { ok: true, status: 200, json: async () => [] } as Response;
  });
}

describe("Dashboard", () => {
  it("renders the Dashboard heading", async () => {
    setupMocks();
    renderWithProviders(<Dashboard />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows Service Health section with UP status", async () => {
    setupMocks({ healthUp: true });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Product Service")).toBeInTheDocument();
    });
    expect(screen.getByText("Order Service")).toBeInTheDocument();

    await waitFor(() => {
      const badges = screen.getAllByText("UP");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("shows DOWN badge when health check fails", async () => {
    setupMocks({ healthError: true });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      const badges = screen.getAllByText("DOWN");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("renders stats with correct counts", async () => {
    setupMocks();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Total Products")).toBeInTheDocument();
    });
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getByText("Confirmed Orders")).toBeInTheDocument();
  });

  it("renders recent orders table", async () => {
    setupMocks();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Recent Orders")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    });
    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });

  it("shows 'No orders yet' when no orders", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/actuator/health")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: "UP" }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => [],
      } as Response;
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("No orders yet.")).toBeInTheDocument();
    });
  });

  it("renders View all link", async () => {
    setupMocks();
    renderWithProviders(<Dashboard />);
    expect(screen.getByText("View all")).toBeInTheDocument();
  });

  it("renders port numbers for services", async () => {
    setupMocks();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("https://product-service-ua20.onrender.com")).toBeInTheDocument();
    });
    expect(screen.getByText("https://order-service-7342.onrender.com")).toBeInTheDocument();
  });

  it("shows DOWN when health response has no status field", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/actuator/health")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({}),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => [],
      } as Response;
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      const badges = screen.getAllByText("DOWN");
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
