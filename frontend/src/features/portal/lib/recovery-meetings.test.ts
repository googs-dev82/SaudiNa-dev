import { describe, expect, it } from "vitest";
import {
  defaultRecoveryMeetingFilters,
  filterRecoveryMeetings,
  sortRecoveryMeetings,
} from "./recovery-meetings";

const meetings = [
  {
    id: "m1",
    regionId: "r1",
    areaId: "a1",
    nameAr: "اجتماع الأمل",
    nameEn: "Hope Meeting",
    language: "ENGLISH",
    gender: "MIXED",
    city: "Riyadh",
    district: "Olaya",
    dayOfWeek: "Monday",
    startTime: "18:00",
    endTime: "19:00",
    isOnline: false,
    meetingLink: null,
    latitude: 24.7,
    longitude: 46.6,
    addressAr: null,
    addressEn: "Olaya",
    descriptionAr: null,
    descriptionEn: "Weekly meeting",
    status: "PUBLISHED",
    createdById: "u1",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "m2",
    regionId: "r1",
    areaId: "a2",
    nameAr: "اجتماع النور",
    nameEn: "Noor Meeting",
    language: "ARABIC",
    gender: "FEMALE",
    city: "Riyadh",
    district: "Yasmin",
    dayOfWeek: "Wednesday",
    startTime: "20:00",
    endTime: "21:00",
    isOnline: true,
    meetingLink: "https://meeting.local",
    latitude: null,
    longitude: null,
    addressAr: null,
    addressEn: null,
    descriptionAr: null,
    descriptionEn: null,
    status: "DRAFT",
    createdById: "u2",
    createdAt: "2026-04-03T10:00:00.000Z",
    updatedAt: "2026-04-05T10:00:00.000Z",
  },
];

describe("recovery meeting helpers", () => {
  it("filters by status and scope", () => {
    const results = filterRecoveryMeetings(meetings, {
      ...defaultRecoveryMeetingFilters,
      areaId: "a1",
      status: "PUBLISHED",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("m1");
  });

  it("sorts by most recently updated by default selection", () => {
    const sorted = sortRecoveryMeetings(meetings, "updated-desc");
    expect(sorted[0]?.id).toBe("m2");
  });
});
