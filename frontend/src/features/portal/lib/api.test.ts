import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getPortalToken = vi.fn();

vi.mock("./session", () => ({
  getPortalToken: (...args: unknown[]) => getPortalToken(...args),
}));

describe("portal api", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    getPortalToken.mockReset();
  });

  it("loads the signed-in profile when token and API config are present", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    getPortalToken.mockResolvedValue("token-1");
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "u1",
          email: "user@test.com",
          displayName: "User",
          roles: ["SUPER_ADMIN"],
          assignments: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { getPortalProfile } = await import("./api");

    await expect(getPortalProfile()).resolves.toMatchObject({
      id: "u1",
      roles: ["SUPER_ADMIN"],
    });
  });

  it("throws a portal API error when configuration is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    getPortalToken.mockResolvedValue(null);

    const { getPortalProfile, PortalApiError } = await import("./api");

    await expect(getPortalProfile()).rejects.toBeInstanceOf(PortalApiError);
  });

  it("surfaces backend error payloads for portal reads", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    getPortalToken.mockResolvedValue("token-1");
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { getPortalRecoveryMeetings } = await import("./api");

    await expect(getPortalRecoveryMeetings()).rejects.toThrow("Forbidden");
  });

  it("returns a reachability error when the backend is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    getPortalToken.mockResolvedValue("token-1");
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("offline"));

    const { getPortalReports } = await import("./api");

    await expect(getPortalReports()).rejects.toThrow("Unable to reach the backend API.");
  });
});
