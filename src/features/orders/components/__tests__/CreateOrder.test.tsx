import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
} from "../../../../../tests/test-utils";
import { CreateOrder } from "../CreateOrder";

const mockProducts = [
  {
    id: "p1",
    name: "Wireless Keyboard",
    description: "Bluetooth mechanical keyboard",
    price: 79.99,
    category: "Electronics",
    inStock: true,
  },
  {
    id: "p2",
    name: "Out of Stock Item",
    description: "Not available",
    price: 19.99,
    category: "Other",
    inStock: false,
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("CreateOrder", () => {
  it("renders the form with product dropdown", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockProducts,
    } as Response);

    renderWithProviders(<CreateOrder />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByText("Create Order")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Product")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
  });

  it("only shows in-stock products in dropdown", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockProducts,
    } as Response);

    renderWithProviders(<CreateOrder />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByText(/Wireless Keyboard/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Out of Stock Item/)).not.toBeInTheDocument();
  });

  it("shows product preview when a product is selected", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockProducts,
    } as Response);

    renderWithProviders(<CreateOrder />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByText(/Wireless Keyboard/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText("Product"), "p1");

    expect(
      screen.getByText("Bluetooth mechanical keyboard"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Estimated total: \$79.99/)).toBeInTheDocument();
  });

  it("updates estimated total when quantity changes", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockProducts,
    } as Response);

    renderWithProviders(<CreateOrder />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByText(/Wireless Keyboard/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText("Product"), "p1");
    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "3");

    expect(screen.getByText(/Estimated total: \$239.97/)).toBeInTheDocument();
  });

  it("submits order and navigates to orders list", async () => {
    const user = userEvent.setup();
    // First call: products list
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProducts,
      } as Response)
      // Second call: create order
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: "new-order",
          productId: "p1",
          productName: "Wireless Keyboard",
          quantity: 2,
          totalPrice: 159.98,
          status: "CONFIRMED",
        }),
      } as Response);

    renderWithProviders(<CreateOrder />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByText(/Wireless Keyboard/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText("Product"), "p1");
    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "2");
    await user.click(screen.getByText("Place Order"));
  });

  it("shows error message on submission failure", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProducts,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: async () => "Product not found",
      } as Response);

    renderWithProviders(<CreateOrder />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByText(/Wireless Keyboard/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText("Product"), "p1");
    await user.click(screen.getByText("Place Order"));

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to create order/),
      ).toBeInTheDocument();
    });
  });

  it("disables Place Order button when no product selected", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockProducts,
    } as Response);

    renderWithProviders(<CreateOrder />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByText("Place Order")).toBeDisabled();
    });
  });

  it("renders Back to Orders link", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

    renderWithProviders(<CreateOrder />, { initialEntries: ["/orders/new"] });
    expect(screen.getByText(/Back to Orders/)).toBeInTheDocument();
  });

  it("shows Placing Order… while mutation is pending", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProducts,
      } as Response)
      // Never-resolving fetch to keep mutation pending
      .mockImplementationOnce(() => new Promise(() => {}));

    renderWithProviders(<CreateOrder />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByText(/Wireless Keyboard/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText("Product"), "p1");
    await user.click(screen.getByText("Place Order"));

    await waitFor(() => {
      expect(screen.getByText("Placing Order…")).toBeInTheDocument();
    });
  });
});
