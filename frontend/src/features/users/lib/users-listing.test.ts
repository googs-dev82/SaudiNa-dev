import { describe, expect, it } from "vitest";
import {
  buildUsersDirectoryEntries,
  filterUsersDirectoryEntries,
  getUserInitials,
  getUsersRoleOptions,
} from "./users-listing";

const users = [
  {
    id: "u1",
    email: "admin@test.com",
    displayName: "Saudi Admin",
    status: "ACTIVE",
    provider: "GOOGLE",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    lastLoginAt: "2026-04-10T00:00:00.000Z",
  },
  {
    id: "u2",
    email: "editor@test.com",
    displayName: "Content Editor",
    status: "INACTIVE",
    provider: "ZOHO",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    lastLoginAt: null,
  },
] as const;

const assignments = [
  {
    id: "a1",
    userId: "u1",
    roleCode: "SUPER_ADMIN",
    scopeType: "GLOBAL",
    scopeId: null,
    scopeCode: null,
    activeFrom: null,
    activeUntil: null,
    active: true,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
  {
    id: "a2",
    userId: "u2",
    roleCode: "CONTENT_EDITOR",
    scopeType: "GLOBAL",
    scopeId: null,
    scopeCode: null,
    activeFrom: null,
    activeUntil: null,
    active: true,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
  },
] as const;

describe("users listing helpers", () => {
  it("creates initials from names", () => {
    expect(getUserInitials("Saudi Admin")).toBe("SA");
    expect(getUserInitials("Mono")).toBe("MO");
  });

  it("derives role options from assignments", () => {
    expect(getUsersRoleOptions(assignments as never)).toEqual([
      "CONTENT_EDITOR",
      "SUPER_ADMIN",
    ]);
  });

  it("builds and filters directory entries", () => {
    const entries = buildUsersDirectoryEntries(users as never, {
      assignments: assignments as never,
      regions: [],
      areas: [],
      committees: [],
    });

    expect(entries[0]?.assignmentCount).toBe(1);
    expect(entries[0]?.scopeSummary).toContain("Global access");

    const filtered = filterUsersDirectoryEntries(entries, {
      query: "editor",
      status: "INACTIVE",
      role: "CONTENT_EDITOR",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.user.id).toBe("u2");
  });
});
