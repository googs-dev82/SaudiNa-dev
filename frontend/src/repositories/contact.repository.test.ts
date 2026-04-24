import { afterEach, describe, expect, it, vi } from "vitest";

describe("contactRepository", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("returns success immediately when API base URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    const { contactRepository } = await import("./contact.repository");

    await expect(
      contactRepository.submit({
        name: "User",
        email: "user@test.com",
        subject: "Support",
        message: "Help",
      }),
    ).resolves.toEqual({ success: true });
  });

  it("posts contact submissions to the backend when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(new Response("{}", { status: 201 }));

    const { contactRepository } = await import("./contact.repository");

    await contactRepository.submit({
      name: "User",
      email: "user@test.com",
      subject: "Support",
      message: "Help",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/public/contact",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("throws when the contact endpoint is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("boom", { status: 500 }));

    const { contactRepository } = await import("./contact.repository");

    await expect(
      contactRepository.submit({
        name: "User",
        email: "user@test.com",
        subject: "Support",
        message: "Help",
      }),
    ).rejects.toThrow("Unable to submit contact form.");
  });
});
