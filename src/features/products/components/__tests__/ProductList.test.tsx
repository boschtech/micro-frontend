import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../../../tests/test-utils";
import { ProductList } from "../ProductList";

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
    name: "USB Mouse",
    description: "Ergonomic wireless mouse",
    price: 29.99,
    category: "Electronics",
    inStock: false,
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ProductList", () => {
  it("renders loading state initially", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}), // never resolves
    );
    renderWithProviders(<ProductList />);
    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  it("renders product cards after data loads", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockProducts,
    } as Response);

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Wireless Keyboard")).toBeInTheDocument();
    });

    expect(screen.getByText("USB Mouse")).toBeInTheDocument();
    expect(screen.getByText("$79.99")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("renders empty state when no products", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument();
    });
  });

  it("renders error state on API failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error"),
    );

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
    });
  });

  it("shows new product button", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockProducts,
    } as Response);

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("New Product")).toBeInTheDocument();
    });
  });

  it("toggles create form and submits new product", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProducts,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "p3", name: "New Item" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [...mockProducts, { id: "p3", name: "New Item", description: "", price: 10, category: "Test", inStock: true }],
      } as Response);

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("New Product")).toBeInTheDocument();
    });

    await user.click(screen.getByText("New Product"));
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Name"), "New Item");
    await user.type(screen.getByLabelText("Category"), "Test");
    await user.type(screen.getByLabelText("Price"), "10");
    await user.click(screen.getByText("Create"));
  });

  it("calls delete on a product", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProducts,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockProducts[1]],
      } as Response);

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getAllByText("Delete")).toHaveLength(2);
    });

    await user.click(screen.getAllByText("Delete")[0]!);
  });
});
