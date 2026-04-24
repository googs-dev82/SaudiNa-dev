import { describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/meetings.repository", () => ({
  meetingsRepository: {
    list: vi.fn().mockResolvedValue({ items: [{ id: "m1" }], nextCursor: null }),
    findById: vi.fn().mockResolvedValue({ id: "m1", nameAr: "اجتماع", nameEn: "Meeting", city: "Riyadh", dayOfWeek: "Sunday", startTime: "19:00" }),
  },
}));

import { meetingsService } from "@/services/meetings.service";

describe("meetingsService", () => {
  it("returns list data through repository", async () => {
    const result = await meetingsService.list();
    expect(result.items).toHaveLength(1);
  });

  it("returns a meeting by id", async () => {
    const result = await meetingsService.getById("m1");
    expect(result?.id).toBe("m1");
  });
});
