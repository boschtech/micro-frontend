import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor, userEvent } from "../test-utils";
import { App } from "@/App";
import { setupMockServer } from "./mock-server";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Products – component test", () => {
  it("displays the product list with all products", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByText("Widget Alpha")).toBeInTheDocument();
    });

    expect(screen.getByText("Gadget Beta")).toBeInTheDocument();
    expect(screen.getByText("Gizmo Gamma")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });

  it("shows stock status badges for each product", async () => {
    setupMockServer();

    renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByText("Widget Alpha")).toBeInTheDocument();
    });

    const inStockBadges = screen.getAllByText("In Stock");
    const outOfStockBadges = screen.getAllByText("Out of Stock");
    expect(inStockBadges).toHaveLength(2);
    expect(outOfStockBadges).toHaveLength(1);
  });

  it("shows empty state when no products exist", async () => {
    setupMockServer({ products: [] });

    renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByText("No products found.")).toBeInTheDocument();
    });
  });

  it("shows error state when product fetch fails", async () => {
    setupMockServer({ failProducts: true });

    renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByText("Failed to load products.")).toBeInTheDocument();
    });
  });

  it("creates a new product via the form", async () => {
    const fetchSpy = setupMockServer();
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByText("Widget Alpha")).toBeInTheDocument();
    });

    // Open the create form
    await user.click(screen.getByRole("button", { name: "New Product" }));
    expect(screen.getByText("Create Product")).toBeInTheDocument();

    // Fill in the form
    await user.type(screen.getByLabelText("Name"), "New Widget");
    await user.type(screen.getByLabelText("Category"), "Widgets");
    await user.type(screen.getByLabelText("Description"), "A brand new widget");
    await user.type(screen.getByLabelText("Price"), "39.99");

    // Submit
    await user.click(screen.getByRole("button", { name: "Create" }));

    // Verify POST was called
    await waitFor(() => {
      const postCalls = fetchSpy.mock.calls.filter(
        ([url, init]) =>
          typeof url === "string" &&
          url.endsWith("/api/products") &&
          (init as RequestInit)?.method === "POST",
      );
      expect(postCalls).toHaveLength(1);
    });
  });

  it("toggles the create form with New Product / Cancel", async () => {
    setupMockServer();
    const user = userEvent.setup();

    renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByText("Widget Alpha")).toBeInTheDocument();
    });

    // Open form
    await user.click(screen.getByRole("button", { name: "New Product" }));
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    // Close form
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Create Product")).not.toBeInTheDocument();
  });

  it("renders product detail page with product info", async () => {
    setupMockServer();

    renderWithProviders(<App />, {
      initialEntries: ["/products/prod-0001-abcd-efgh"],
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha" })).toBeInTheDocument();
    });

    expect(screen.getByText("Widgets")).toBeInTheDocument();
    expect(screen.getByText("A premium widget for all your needs")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("shows associated orders on product detail page", async () => {
    setupMockServer();

    renderWithProviders(<App />, {
      initialEntries: ["/products/prod-0001-abcd-efgh"],
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha" })).toBeInTheDocument();
    });

    // Widget Alpha has 2 orders
    await waitFor(() => {
      expect(screen.getByText("(2)")).toBeInTheDocument();
    });
  });

  it("shows 'No orders for this product.' when product has no orders", async () => {
    setupMockServer();

    renderWithProviders(<App />, {
      initialEntries: ["/products/prod-0003-qrst-uvwx"],
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Gizmo Gamma" })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("No orders for this product.")).toBeInTheDocument();
    });
  });

  it("opens edit form on product detail and submits update", async () => {
    const fetchSpy = setupMockServer();
    const user = userEvent.setup();

    renderWithProviders(<App />, {
      initialEntries: ["/products/prod-0001-abcd-efgh"],
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha" })).toBeInTheDocument();
    });

    // Open edit form
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByText("Edit Product")).toBeInTheDocument();

    // Modify the name
    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Widget Alpha Pro");

    // Submit
    await user.click(screen.getByRole("button", { name: "Update" }));

    // Verify PUT was called
    await waitFor(() => {
      const putCalls = fetchSpy.mock.calls.filter(
        ([url, init]) =>
          typeof url === "string" &&
          url.includes("/api/products/prod-0001") &&
          (init as RequestInit)?.method === "PUT",
      );
      expect(putCalls).toHaveLength(1);
    });
  });

  it("deletes a product from the detail page", async () => {
    const fetchSpy = setupMockServer();
    const user = userEvent.setup();

    renderWithProviders(<App />, {
      initialEntries: ["/products/prod-0001-abcd-efgh"],
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha" })).toBeInTheDocument();
    });

    // Click delete
    await user.click(screen.getByRole("button", { name: "Delete" }));

    // Verify DELETE was called
    await waitFor(() => {
      const deleteCalls = fetchSpy.mock.calls.filter(
        ([url, init]) =>
          typeof url === "string" &&
          url.includes("/api/products/prod-0001") &&
          (init as RequestInit)?.method === "DELETE",
      );
      expect(deleteCalls).toHaveLength(1);
    });

    // Should navigate back to product list
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument();
    });
  });

  it("shows 'Product not found.' for a non-existent product", async () => {
    setupMockServer();

    renderWithProviders(<App />, {
      initialEntries: ["/products/non-existent-id"],
    });

    await waitFor(() => {
      expect(screen.getByText("Product not found.")).toBeInTheDocument();
    });
  });

  it("has a back link to products list on detail page", async () => {
    setupMockServer();

    renderWithProviders(<App />, {
      initialEntries: ["/products/prod-0001-abcd-efgh"],
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha" })).toBeInTheDocument();
    });

    expect(screen.getByText(/Back to Products/)).toBeInTheDocument();
  });
});
