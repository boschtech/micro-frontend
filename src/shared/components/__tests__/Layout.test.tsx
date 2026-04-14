import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "../../../../tests/test-utils";
import { Layout } from "../Layout";

describe("Layout", () => {
  it("renders children", () => {
    renderWithProviders(
      <Layout>
        <p>Child content</p>
      </Layout>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders the Navbar", () => {
    renderWithProviders(
      <Layout>
        <div />
      </Layout>,
    );
    expect(screen.getByText("Bosch Tech")).toBeInTheDocument();
  });
});
