import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders, screen, waitFor, userEvent } from "../test-utils";
import { App } from "@/App";
import { ProductForm } from "@/features/products/components/ProductForm";
import { setupMockServer, mockProducts } from "../component/mock-server";
import { expectNoA11yViolations } from "./a11y-utils";

const firstProductId = mockProducts[0]!.id;

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("a11y: Products", () => {
  it("ProductList page has no a11y violations", async () => {
    setupMockServer();
    const { container } = renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /products/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Widget Alpha")).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
    
  });

  it("ProductList empty state has no a11y violations", async () => {
    setupMockServer({ products: [] });
    const { container } = renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByText("No products found.")).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
    
  });

  it("ProductList with the Create Product form open has no a11y violations", async () => {
    setupMockServer();
    const { container } = renderWithProviders(<App />, { initialEntries: ["/products"] });

    await waitFor(() => {
      expect(screen.getByText("Widget Alpha")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /new product/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /create product/i })).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
    
  });

  it("ProductDetail page has no a11y violations", async () => {
    setupMockServer();
    const { container } = renderWithProviders(<App />, {
      initialEntries: [`/products/${firstProductId}`],
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha", level: 1 })).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
    
  });

  it("ProductDetail with the Edit form open has no a11y violations", async () => {
    setupMockServer();
    const { container } = renderWithProviders(<App />, {
      initialEntries: [`/products/${firstProductId}`],
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Widget Alpha", level: 1 })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /edit product/i })).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
    
  });

  it("ProductForm rendered standalone has no a11y violations", async () => {
    const { container } = renderWithProviders(
      <ProductForm onSubmit={() => {}} isSubmitting={false} />,
    );

    await expectNoA11yViolations(container);
    
  });

  it("ProductForm in the submitting state has no a11y violations", async () => {
    const { container } = renderWithProviders(
      <ProductForm onSubmit={() => {}} isSubmitting={true} />,
    );

    await expectNoA11yViolations(container);
    
  });
});
