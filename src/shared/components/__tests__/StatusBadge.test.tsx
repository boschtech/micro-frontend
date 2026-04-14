import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders the status text", () => {
    render(<StatusBadge value="CONFIRMED" />);
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
  });

  it("applies green styles for CONFIRMED", () => {
    render(<StatusBadge value="CONFIRMED" />);
    const badge = screen.getByText("CONFIRMED");
    expect(badge.className).toContain("bg-green-100");
  });

  it("applies yellow styles for PENDING", () => {
    render(<StatusBadge value="PENDING" />);
    const badge = screen.getByText("PENDING");
    expect(badge.className).toContain("bg-yellow-100");
  });

  it("applies red styles for DOWN", () => {
    render(<StatusBadge value="DOWN" />);
    const badge = screen.getByText("DOWN");
    expect(badge.className).toContain("bg-red-100");
  });

  it("applies gray styles for unknown status", () => {
    render(<StatusBadge value="UNKNOWN" />);
    const badge = screen.getByText("UNKNOWN");
    expect(badge.className).toContain("bg-gray-100");
  });
});
