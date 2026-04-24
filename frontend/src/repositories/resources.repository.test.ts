import { afterEach, describe, expect, it, vi } from "vitest";

describe("resourcesRepository", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("throws when API base URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    const { resourcesRepository } = await import("./resources.repository");

    await expect(resourcesRepository.list()).rejects.toThrow(
      "NEXT_PUBLIC_API_BASE_URL is required to load resources.",
    );
  });

  it("requests resource downloads from the backend when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "r1", url: "https://download" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { resourcesRepository } = await import("./resources.repository");

    await resourcesRepository.getDownloadUrl("r1");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/public/resources/r1/download",
      expect.anything(),
    );
  });
});
