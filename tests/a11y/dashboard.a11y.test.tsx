import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "../test-utils";
import { App } from "@/App";
import { setupMockServer } from "../component/mock-server";
import { expectNoA11yViolations } from "./a11y-utils";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("a11y: Dashboard", () => {
  it("renders the Dashboard page with no a11y violations (populated)", async () => {
    setupMockServer();
    const { container } = renderWithProviders(<App />, { initialEntries: ["/"] });

    // Wait for data to hydrate so the full DOM is exercised by axe.
    await waitFor(() => {
      expect(screen.getByText("Recent Orders")).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
  });

  it("renders the Dashboard page with no a11y violations (empty state)", async () => {
    setupMockServer({ products: [], orders: [] });
    const { container } = renderWithProviders(<App />, { initialEntries: ["/"] });

    await waitFor(() => {
      expect(screen.getByText("No orders yet.")).toBeInTheDocument();
    });

    await expectNoA11yViolations(container);
  });

  it("renders the Dashboard page with no a11y violations (services DOWN)", async () => {
    setupMockServer({ failHealth: true });
    const { container } = renderWithProviders(<App />, { initialEntries: ["/"] });

    await waitFor(() => {
      expect(screen.getAllByText("DOWN").length).toBeGreaterThanOrEqual(2);
    });

    await expectNoA11yViolations(container);
  });
});
