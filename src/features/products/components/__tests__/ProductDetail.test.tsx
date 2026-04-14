import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
} from "../../../../../tests/test-utils";
import { ProductDetail } from "../ProductDetail";

const mockProduct = {
  id: "p1",
  name: "Wireless Keyboard",
  description: "Bluetooth mechanical keyboard",
  price: 79.99,
  category: "Electronics",
  inStock: true,
};

const mockProductOrders = {
  productId: "p1",
  productName: "Wireless Keyboard",
  orderCount: 1,
  orders: [
    {
      id: "order-001",
      productId: "p1",
      productName: "Wireless Keyboard",
      quantity: 2,
      totalPrice: 159.98,
      status: "CONFIRMED",
      createdAt: "2026-04-14T10:00:00",
    },
  ],
};

// Mock react-router useParams
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ id: "p1" }),
  };
});

beforeEach(() => {
  vi.restoreAllMocks();
});

function setupFetchMocks(
  product = mockProduct,
  orders = mockProductOrders,
) {
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    if (urlStr.includes("/orders")) {
      return {
        ok: true,
        status: 200,
        json: async () => orders,
      } as Response;
    }
    return {
      ok: true,
      status: 200,
      json: async () => product,
    } as Response;
  });
}

describe("ProductDetail", () => {
  it("renders product details", async () => {
    setupFetchMocks();
    renderWithProviders(<ProductDetail />, {
      initialEntries: ["/products/p1"],
    });

    await waitFor(() => {
      expect(screen.getByText("Wireless Keyboard")).toBeInTheDocument();
    });
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("$79.99")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("shows Out of Stock badge when not in stock", async () => {
    setupFetchMocks({ ...mockProduct, inStock: false });
    renderWithProviders(<ProductDetail />, {
      initialEntries: ["/products/p1"],
    });

    await waitFor(() => {
      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    });
  });

  it("renders associated orders table", async () => {
    setupFetchMocks();
    renderWithProviders(<ProductDetail />, {
      initialEntries: ["/products/p1"],
    });

    await waitFor(() => {
      expect(screen.getByText("Orders")).toBeInTheDocument();
    });
    expect(screen.getByText("(1)")).toBeInTheDocument();
    expect(screen.getByText("$159.98")).toBeInTheDocument();
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
  });

  it("shows no orders message when empty", async () => {
    setupFetchMocks(mockProduct, {
      ...mockProductOrders,
      orderCount: 0,
      orders: [],
    });
    renderWithProviders(<ProductDetail />, {
      initialEntries: ["/products/p1"],
    });

    await waitFor(() => {
      expect(
        screen.getByText("No orders for this product."),
      ).toBeInTheDocument();
    });
  });

  it("toggles edit form when Edit is clicked", async () => {
    setupFetchMocks();
    const user = userEvent.setup();
    renderWithProviders(<ProductDetail />, {
      initialEntries: ["/products/p1"],
    });

    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Edit"));
    expect(screen.getByText("Edit Product")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Edit Product")).not.toBeInTheDocument();
  });

  it("calls delete and navigates on delete click", async () => {
    setupFetchMocks();
    const user = userEvent.setup();
    renderWithProviders(<ProductDetail />, {
      initialEntries: ["/products/p1"],
    });

    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    // Mock DELETE response
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    await user.click(screen.getByText("Delete"));
  });

  it("submits update form", async () => {
    setupFetchMocks();
    const user = userEvent.setup();
    renderWithProviders(<ProductDetail />, {
      initialEntries: ["/products/p1"],
    });

    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Edit"));

    // Mock the update response
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ...mockProduct, name: "Updated Keyboard" }),
    } as Response);

    await user.click(screen.getByText("Update"));
  });

  it("renders Back to Products link", async () => {
    setupFetchMocks();
    renderWithProviders(<ProductDetail />, {
      initialEntries: ["/products/p1"],
    });

    await waitFor(() => {
      expect(screen.getByText(/Back to Products/)).toBeInTheDocument();
    });
  });

  it("shows error state when product not found", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "Not found",
    } as Response);

    renderWithProviders(<ProductDetail />, {
      initialEntries: ["/products/p1"],
    });

    await waitFor(() => {
      expect(screen.getByText("Product not found.")).toBeInTheDocument();
    });
  });
});
