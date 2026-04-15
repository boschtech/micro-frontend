import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor, userEvent } from "../test-utils";
import { App } from "@/App";
import { setupMockServer } from "./mock-server";

beforeEach(() => {
  vi.restoreAllMocks();
  setupMockServer();
});

describe("Navigation – component test", () => {
  it("renders the navbar with brand and all nav links", () => {
    renderWithProviders(<App />, { initialEntries: ["/"] });

    expect(screen.getByText("Bosch Tech")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Products" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Orders" })).toBeInTheDocument();
  });

  it("navigates from Dashboard to Products via navbar", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: "Products" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument();
    });
  });

  it("navigates from Dashboard to Orders via navbar", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: "Orders" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
    });
  });

  it("navigates from Products back to Dashboard via navbar", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: "Dashboard" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    });
  });

  it("navigates from product list to product detail via product link", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByText("Widget Alpha")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Widget Alpha"));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha" })).toBeInTheDocument();
      expect(screen.getByText("A premium widget for all your needs")).toBeInTheDocument();
    });
  });

  it("navigates from product detail back to product list via back link", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, {
      initialEntries: ["/products/prod-0001-abcd-efgh"],
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha" })).toBeInTheDocument();
    });

    await user.click(screen.getByText(/Back to Products/));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument();
    });
  });

  it("navigates from create order back to order list via back link", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Create Order" })).toBeInTheDocument();
    });

    await user.click(screen.getByText(/Back to Orders/));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
    });
  });

  it("navigates from order list to create order via New Order link", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/orders"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: "New Order" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Create Order" })).toBeInTheDocument();
    });
  });

  it("full journey: Dashboard → Products → Detail → Back → Orders → New Order", async () => {
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/"] });

    // Start on Dashboard
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    });

    // Go to Products
    await user.click(screen.getByRole("link", { name: "Products" }));
    await waitFor(() => {
      expect(screen.getByText("Widget Alpha")).toBeInTheDocument();
    });

    // Go to Product Detail
    await user.click(screen.getByText("Widget Alpha"));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha" })).toBeInTheDocument();
    });

    // Back to Products
    await user.click(screen.getByText(/Back to Products/));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument();
    });

    // Go to Orders
    await user.click(screen.getByRole("link", { name: "Orders" }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
    });

    // Go to New Order
    await user.click(screen.getByRole("link", { name: "New Order" }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Create Order" })).toBeInTheDocument();
    });
  });
});
