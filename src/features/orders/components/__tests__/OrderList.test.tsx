import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../../../tests/test-utils";
import { OrderList } from "../OrderList";

const mockOrders = [
  {
    id: "order-001",
    productId: "p1",
    productName: "Wireless Keyboard",
    quantity: 2,
    totalPrice: 159.98,
    status: "CONFIRMED",
    createdAt: "2026-04-14T10:00:00",
  },
  {
    id: "order-002",
    productId: "p2",
    productName: "USB Mouse",
    quantity: 1,
    totalPrice: 29.99,
    status: "PENDING",
    createdAt: "2026-04-14T11:00:00",
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("OrderList", () => {
  it("renders loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}),
    );
    renderWithProviders(<OrderList />);
    expect(screen.getByText(/loading orders/i)).toBeInTheDocument();
  });

  it("renders order table after data loads", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockOrders,
    } as Response);

    renderWithProviders(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText("Wireless Keyboard")).toBeInTheDocument();
    });

    expect(screen.getByText("USB Mouse")).toBeInTheDocument();
    expect(screen.getByText("$159.98")).toBeInTheDocument();
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });

  it("renders empty state when no orders", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

    renderWithProviders(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
    });
  });

  it("renders error state on API failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    renderWithProviders(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load orders/i)).toBeInTheDocument();
    });
  });

  it("shows new order link", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockOrders,
    } as Response);

    renderWithProviders(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText("New Order")).toBeInTheDocument();
    });
  });
});
