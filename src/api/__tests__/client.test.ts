import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, ApiError } from "../client";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("apiFetch", () => {
  it("returns parsed JSON on success", async () => {
    const data = { id: "1", name: "Test" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => data,
    } as Response);

    const result = await apiFetch("/api/test");
    expect(result).toEqual(data);
  });

  it("throws ApiError on non-OK response with body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "Not found",
    } as Response);

    await expect(apiFetch("/api/test")).rejects.toThrow(ApiError);
  });

  it("throws ApiError with statusText when body is empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "",
    } as Response);

    await expect(apiFetch("/api/test")).rejects.toThrow("Internal Server Error");
  });

  it("throws ApiError with statusText when text() rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      text: async () => { throw new Error("stream error"); },
    } as Response);

    await expect(apiFetch("/api/test")).rejects.toThrow("Bad Gateway");
  });

  it("returns undefined for 204 No Content", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    const result = await apiFetch("/api/test");
    expect(result).toBeUndefined();
  });

  it("sends Content-Type header", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await apiFetch("/api/test");

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/test", {
      headers: { "Content-Type": "application/json" },
    });
  });

  it("merges custom options", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await apiFetch("/api/test", { method: "POST", body: '{"a":1}' });

    expect(globalThis.fetch).toHaveBeenCalledWith("/api/test", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: '{"a":1}',
    });
  });
});
