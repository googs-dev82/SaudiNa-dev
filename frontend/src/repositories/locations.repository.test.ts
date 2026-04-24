import { afterEach, describe, expect, it, vi } from "vitest";

describe("locationsRepository", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("throws when API base URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    const { locationsRepository } = await import("./locations.repository");

    await expect(locationsRepository.listRegions()).rejects.toThrow(
      "NEXT_PUBLIC_API_BASE_URL is required to load regions.",
    );
  });

  it("requests areas from the backend when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { locationsRepository } = await import("./locations.repository");

    await locationsRepository.listAreas("region-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/public/areas?regionId=region-1",
      expect.anything(),
    );
  });
});
