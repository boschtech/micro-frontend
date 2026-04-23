import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders, screen, waitFor, userEvent } from "../test-utils";
import { App } from "@/App";
import { setupMockServer } from "../component/mock-server";
import { expectNoA11yViolations } from "./a11y-utils";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("a11y: Orders", () => {
  it("OrderList page has no a11y violations", async () => {
    setupMockServer();
    const { container } = renderWithProviders(<App />, { initialEntries: ["/orders"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /orders/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Gadget Beta")).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
  });

  it("OrderList empty state has no a11y violations", async () => {
    setupMockServer({ orders: [] });
    const { container } = renderWithProviders(<App />, { initialEntries: ["/orders"] });

    await waitFor(() => {
      expect(screen.getByText("No orders found.")).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
  });

  it("CreateOrder page has no a11y violations (pristine)", async () => {
    setupMockServer();
    const { container } = renderWithProviders(<App />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /create order/i })).toBeInTheDocument();
      // Products have loaded into the select.
      expect(screen.getByRole("option", { name: /widget alpha/i })).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
  });

  it("CreateOrder page has no a11y violations with a product selected", async () => {
    setupMockServer();
    const { container } = renderWithProviders(<App />, { initialEntries: ["/orders/new"] });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /widget alpha/i })).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/product/i) as HTMLSelectElement;
    const alphaOption = screen.getByRole("option", {
      name: /widget alpha/i,
    }) as HTMLOptionElement;
    await userEvent.selectOptions(select, alphaOption);

    await waitFor(() => {
      expect(screen.getByText(/estimated total/i)).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
  });
});
