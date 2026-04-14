import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock react-dom/client before importing main
const mockRender = vi.fn();
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({ render: mockRender })),
}));

beforeEach(() => {
  vi.restoreAllMocks();
  mockRender.mockClear();

  // Provide a #root element
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
});

describe("main.tsx", () => {
  it("calls createRoot and renders the app", async () => {
    const { createRoot } = await import("react-dom/client");
    await import("../main");

    expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(mockRender).toHaveBeenCalled();
  });
});
