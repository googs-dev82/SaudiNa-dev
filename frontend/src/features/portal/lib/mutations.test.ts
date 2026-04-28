import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getPortalToken = vi.fn();
const revalidatePath = vi.fn();

vi.mock("./session", () => ({
  getPortalToken: (...args: unknown[]) => getPortalToken(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

function makeFormData(values: Record<string, string | undefined | boolean>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    formData.set(key, typeof value === "boolean" ? (value ? "on" : "") : value);
  }

  return formData;
}

describe("portal mutations", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    getPortalToken.mockReset();
    revalidatePath.mockReset();
  });

  it("creates portal users and revalidates the users page", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    getPortalToken.mockResolvedValue("token-1");
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "u1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { createPortalUserAction } = await import("./mutations");

    await createPortalUserAction(
      makeFormData({
        email: "user@test.com",
        displayName: "Portal User",
        provider: "GOOGLE",
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/users",
      expect.objectContaining({ method: "POST" }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/portal/admin/users");
  });

  it("rejects in-service meeting creation when planned activities JSON is invalid", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    getPortalToken.mockResolvedValue("token-1");

    const { createPortalInServiceMeetingAction } = await import("./mutations");

    await expect(
      createPortalInServiceMeetingAction(
        makeFormData({
          committeeId: "committee-1",
          meetingFormat: "PHYSICAL",
          titleAr: "اجتماع",
          titleEn: "Meeting",
          meetingDate: "2026-04-08T00:00:00.000Z",
          startTime: "18:00",
          venueName: "Committee office",
          city: "Riyadh",
          address: "Main service office",
          mom: "Minutes content that is long enough",
          plannedActivities: "[invalid",
        }),
      ),
    ).rejects.toThrow("Planned activities must be valid JSON array.");
  });

  it("creates reports with parsed JSON filters", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    getPortalToken.mockResolvedValue("token-1");
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "r1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { createPortalReportAction } = await import("./mutations");

    await createPortalReportAction(
      makeFormData({
        type: "RECOVERY_SUMMARY",
        filters: "{\"city\":\"Riyadh\"}",
        approvalRequired: true,
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/admin/reports",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          type: "RECOVERY_SUMMARY",
          filters: { city: "Riyadh" },
          approvalRequired: true,
        }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/portal/reports");
  });

  it("updates recovery meetings with numeric coordinates", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    getPortalToken.mockResolvedValue("token-1");
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "m1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { updatePortalRecoveryMeetingAction } = await import("./mutations");

    await updatePortalRecoveryMeetingAction(
      makeFormData({
        meetingId: "m1",
        regionId: "r1",
        areaId: "a1",
        nameAr: "اجتماع الأمل",
        nameEn: "Hope Meeting",
        language: "EN",
        gender: "MIXED",
        city: "Riyadh",
        dayOfWeek: "WEDNESDAY",
        startTime: "19:00",
        isOnline: false,
        latitude: "24.7",
        longitude: "46.6",
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/admin/meetings/recovery/m1",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("\"latitude\":24.7"),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/portal/meetings/recovery");
  });

  it("deletes recovery meetings through the backend API", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    getPortalToken.mockResolvedValue("token-1");
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "m1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { deleteRecoveryMeetingAction } = await import("./mutations");

    await deleteRecoveryMeetingAction(
      makeFormData({
        meetingId: "m1",
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/admin/meetings/recovery/m1",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/portal/meetings/recovery");
  });

  it("throws the backend mutation message when the portal mutation fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    getPortalToken.mockResolvedValue("token-1");
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Mutation denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { approvePortalReportAction } = await import("./mutations");

    await expect(
      approvePortalReportAction(makeFormData({ reportId: "r1" })),
    ).rejects.toThrow("Mutation denied");
  });
});
