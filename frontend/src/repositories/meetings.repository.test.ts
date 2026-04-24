import { afterEach, describe, expect, it, vi } from "vitest";

describe("meetingsRepository", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("throws when API base URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    const { meetingsRepository } = await import("./meetings.repository");

    await expect(meetingsRepository.list()).rejects.toThrow(
      "NEXT_PUBLIC_API_BASE_URL is required to load meetings.",
    );
  });

  it("requests meetings from the backend when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [], nextCursor: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { meetingsRepository } = await import("./meetings.repository");

    await meetingsRepository.list({ city: "Riyadh" });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/public/meetings?city=Riyadh",
      expect.anything(),
    );
  });
});
