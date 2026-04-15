import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor, userEvent } from "../test-utils";
import { App } from "@/App";
import { setupMockServer } from "./mock-server";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Orders – component test", () => {
  it("displays the order list with all orders", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/orders"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
    });

    // Check order data is rendered
    await waitFor(() => {
      expect(screen.getAllByText("Widget Alpha").length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText("Gadget Beta")).toBeInTheDocument();
    expect(screen.getByText("$59.98")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
    expect(screen.getByText("$89.97")).toBeInTheDocument();
  });

  it("shows order status badges", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/orders"] });

    await waitFor(() => {
      expect(screen.getAllByText("CONFIRMED").length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });

  it("shows empty state when no orders exist", async () => {
    setupMockServer({ orders: [] });

    renderWithProviders(<App />, { initialEntries: ["/orders"] });

    await waitFor(() => {
      expect(screen.getByText("No orders found.")).toBeInTheDocument();
    });
  });

  it("shows error state when order fetch fails", async () => {
    setupMockServer({ failOrders: true });

    renderWithProviders(<App />, { initialEntries: ["/orders"] });

    await waitFor(() => {
      expect(screen.getByText("Failed to load orders.")).toBeInTheDocument();
    });
  });

  it("has a 'New Order' link that navigates to the create page", async () => {
    setupMockServer();
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

  it("renders the create order form with a product dropdown", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Create Order" })).toBeInTheDocument();
    });

    // Dropdown should list only in-stock products
    const select = screen.getByLabelText("Product");
    expect(select).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Widget Alpha/)).toBeInTheDocument();
      expect(screen.getByText(/Gadget Beta/)).toBeInTheDocument();
    });

    // Gizmo Gamma is out of stock – should not be an option
    const options = select.querySelectorAll("option");
    const optionTexts = Array.from(options).map((o) => o.textContent);
    expect(optionTexts.some((t) => t?.includes("Gizmo Gamma"))).toBe(false);
  });

  it("shows estimated total when a product is selected", async () => {
    setupMockServer();
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByLabelText("Product")).toBeInTheDocument();
    });

    // Wait for products to load in the dropdown
    await waitFor(() => {
      const select = screen.getByLabelText("Product");
      const options = select.querySelectorAll("option");
      expect(options.length).toBeGreaterThan(1);
    });

    // Select Widget Alpha ($29.99)
    await user.selectOptions(screen.getByLabelText("Product"), "prod-0001-abcd-efgh");

    // Default quantity is 1 → estimated total = $29.99
    await waitFor(() => {
      const preview = screen.getByText(/Estimated total/);
      expect(preview).toHaveTextContent("$29.99");
    });
  });

  it("updates estimated total when quantity changes", async () => {
    setupMockServer();
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      const select = screen.getByLabelText("Product");
      const options = select.querySelectorAll("option");
      expect(options.length).toBeGreaterThan(1);
    });

    // Select Widget Alpha ($29.99)
    await user.selectOptions(screen.getByLabelText("Product"), "prod-0001-abcd-efgh");

    // Change quantity to 3 → $89.97
    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "3");

    await waitFor(() => {
      const preview = screen.getByText(/Estimated total/);
      expect(preview).toHaveTextContent("$89.97");
    });
  });

  it("submits a new order and navigates back to order list", async () => {
    const fetchSpy = setupMockServer();
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      const select = screen.getByLabelText("Product");
      const options = select.querySelectorAll("option");
      expect(options.length).toBeGreaterThan(1);
    });

    // Select product and submit
    await user.selectOptions(screen.getByLabelText("Product"), "prod-0001-abcd-efgh");
    await user.click(screen.getByRole("button", { name: "Place Order" }));

    // Verify POST was called
    await waitFor(() => {
      const postCalls = fetchSpy.mock.calls.filter(
        ([url, init]) =>
          typeof url === "string" &&
          url.endsWith("/api/orders") &&
          (init as RequestInit)?.method === "POST",
      );
      expect(postCalls).toHaveLength(1);
    });

    // Should navigate to order list
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
    });
  });

  it("disables place order button when no product is selected", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Create Order" })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: "Place Order" });
    expect(submitButton).toBeDisabled();
  });

  it("has a back link to orders list on create page", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Create Order" })).toBeInTheDocument();
    });

    expect(screen.getByText(/Back to Orders/)).toBeInTheDocument();
  });
});
