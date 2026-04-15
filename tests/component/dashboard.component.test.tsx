import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor, within } from "../test-utils";
import { App } from "@/App";
import { setupMockServer } from "./mock-server";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Dashboard – component test", () => {
  it("shows service health status as UP when services are healthy", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/"] });

    await waitFor(() => {
      const badges = screen.getAllByText("UP");
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("shows service health status as DOWN when health check fails", async () => {
    setupMockServer({ failHealth: true });

    renderWithProviders(<App />, { initialEntries: ["/"] });

    await waitFor(() => {
      const badges = screen.getAllByText("DOWN");
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("displays stats overview with correct counts", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/"] });

    // Use within() to scope numeric values to their stat card
    await waitFor(() => {
      const productCard = screen.getByText("Total Products").closest("a")!;
      expect(within(productCard).getByText("3")).toBeInTheDocument();
    });

    const orderCard = screen.getByText("Total Orders").closest("a")!;
    expect(within(orderCard).getByText("3")).toBeInTheDocument();

    const inStockCard = screen.getByText("In Stock").closest("a")!;
    expect(within(inStockCard).getByText("2")).toBeInTheDocument();

    const confirmedCard = screen.getByText("Confirmed Orders").closest("a")!;
    expect(within(confirmedCard).getByText("2")).toBeInTheDocument();
  });

  it("shows recent orders table with order data", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/"] });

    // Wait for order data to load in the table
    await waitFor(() => {
      expect(screen.getByText("Gadget Beta")).toBeInTheDocument();
    });

    // Widget Alpha appears in multiple order rows
    expect(screen.getAllByText("Widget Alpha").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$59.98")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
    expect(screen.getByText("$89.97")).toBeInTheDocument();
  });

  it("shows 'No orders yet.' when there are no orders", async () => {
    setupMockServer({ orders: [] });

    renderWithProviders(<App />, { initialEntries: ["/"] });

    await waitFor(() => {
      expect(screen.getByText("No orders yet.")).toBeInTheDocument();
    });
  });

  it("shows zero counts when data is empty", async () => {
    setupMockServer({ products: [], orders: [] });

    renderWithProviders(<App />, { initialEntries: ["/"] });

    await waitFor(() => {
      const productCard = screen.getByText("Total Products").closest("a")!;
      expect(within(productCard).getByText("0")).toBeInTheDocument();
    });

    const orderCard = screen.getByText("Total Orders").closest("a")!;
    expect(within(orderCard).getByText("0")).toBeInTheDocument();
  });
});
