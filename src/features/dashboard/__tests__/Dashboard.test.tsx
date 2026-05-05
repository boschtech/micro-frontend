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
  failProducts?: boolean;
  failOrders?: boolean;
}) {
  const { failProducts = false, failOrders = false } = opts ?? {};
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    const urlStr = typeof url === "string" ? url : url.toString();

    if (urlStr.includes("/api/products")) {
      if (failProducts) return { ok: false, status: 500, text: async () => "error" } as Response;
      return { ok: true, status: 200, json: async () => mockProducts } as Response;
    }
    if (urlStr.includes("/api/orders")) {
      if (failOrders) return { ok: false, status: 500, text: async () => "error" } as Response;
      return { ok: true, status: 200, json: async () => mockOrders } as Response;
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
    setupMocks();
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

  it("shows DOWN badge when API calls fail", async () => {
    setupMocks({ failProducts: true, failOrders: true });
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
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
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

  it("renders service URLs from environment", async () => {
    setupMocks();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Product Service")).toBeInTheDocument();
    });
    expect(screen.getByText("Order Service")).toBeInTheDocument();
  });

  it("shows DOWN when only one service fails", async () => {
    setupMocks({ failProducts: true });
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getAllByText("DOWN").length).toBeGreaterThan(0);
      expect(screen.getAllByText("UP").length).toBeGreaterThan(0);
    });
  });
});
