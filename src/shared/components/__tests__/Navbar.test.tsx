import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "../../../../tests/test-utils";
import { Navbar } from "../Navbar";

describe("Navbar", () => {
  it("renders the brand name", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText("Bosch Tech")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("highlights active link for Dashboard at /", () => {
    renderWithProviders(<Navbar />, { initialEntries: ["/"] });
    const link = screen.getByText("Dashboard");
    expect(link.className).toContain("text-bosch-gold");
  });

  it("highlights active link for Products at /products", () => {
    renderWithProviders(<Navbar />, { initialEntries: ["/products"] });
    const link = screen.getByText("Products");
    expect(link.className).toContain("text-bosch-gold");
  });

  it("shows inactive style for non-active links", () => {
    renderWithProviders(<Navbar />, { initialEntries: ["/products"] });
    const link = screen.getByText("Orders");
    expect(link.className).toContain("text-gray-600");
  });
});
