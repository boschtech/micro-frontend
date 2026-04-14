import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor } from "../../tests/test-utils";
import { App } from "../App";

beforeEach(() => {
  vi.restoreAllMocks();
  // Mock fetch for all API calls that components make on mount
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => [],
  } as Response);
});

describe("App", () => {
  it("renders the Dashboard at /", async () => {
    renderWithProviders(<App />, { initialEntries: ["/"] });
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    });
  });

  it("renders ProductList at /products", async () => {
    renderWithProviders(<App />, { initialEntries: ["/products"] });
    await waitFor(() => {
      expect(screen.getByText("Products")).toBeInTheDocument();
    });
  });

  it("renders ProductDetail at /products/:id", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "1",
        name: "Test Product",
        description: "Desc",
        price: 10,
        category: "Cat",
        inStock: true,
      }),
    } as Response);

    renderWithProviders(<App />, { initialEntries: ["/products/1"] });
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("renders OrderList at /orders", async () => {
    renderWithProviders(<App />, { initialEntries: ["/orders"] });
    await waitFor(() => {
      expect(screen.getByText("Orders")).toBeInTheDocument();
    });
  });

  it("renders CreateOrder at /orders/new", async () => {
    renderWithProviders(<App />, { initialEntries: ["/orders/new"] });
    await waitFor(() => {
      expect(screen.getByText("Create Order")).toBeInTheDocument();
    });
  });

  it("renders the Navbar on every route", () => {
    renderWithProviders(<App />, { initialEntries: ["/"] });
    expect(screen.getByText("Bosch Tech")).toBeInTheDocument();
  });
});
