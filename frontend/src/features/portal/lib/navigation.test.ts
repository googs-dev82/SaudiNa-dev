import { describe, expect, it, vi } from "vitest";

vi.mock("./session", () => ({
  hasAnyRole: (user: { roles: string[] }, roles: string[]) => roles.some((role) => user.roles.includes(role)),
  hasPrCommitteeAccess: (user: { roles: string[]; assignments: Array<{ scopeCode: string | null }> }) =>
    user.roles.includes("SUPER_ADMIN") || user.assignments.some((assignment) => assignment.scopeCode === "PR_COMMITTEE"),
}));

import { canAccessPortalHref, getVisiblePortalNavItems } from "./navigation";
import type { PortalUser } from "@/types/portal";

function makeUser(overrides: Partial<PortalUser> = {}): PortalUser {
  return {
    id: "u1",
    email: "user@test.com",
    displayName: "User",
    preferredLanguage: "ar",
    roles: [],
    assignments: [],
    ...overrides,
  };
}

describe("portal navigation", () => {
  it("shows editorial studio only for content editors and super admins", () => {
    const editor = makeUser({ roles: ["CONTENT_EDITOR"] });
    const member = makeUser({ roles: ["AREA_MANAGER"] });

    expect(canAccessPortalHref(editor, "/portal/studio")).toBe(true);
    expect(canAccessPortalHref(member, "/portal/studio")).toBe(false);
  });

  it("shows contact submissions for PR committee scoped users", () => {
    const prUser = makeUser({
      roles: ["CONTENT_EDITOR"],
      assignments: [{ id: "a1", roleCode: "CONTENT_EDITOR", scopeType: "COMMITTEE", scopeId: "c1", scopeCode: "PR_COMMITTEE" }],
    });

    const labels = getVisiblePortalNavItems(prUser).map((item) => item.label);
    expect(labels).toContain("Contact submissions");
  });

  it("keeps admin-only modules hidden from non super admins", () => {
    const areaManager = makeUser({ roles: ["AREA_MANAGER"] });

    const labels = getVisiblePortalNavItems(areaManager).map((item) => item.label);
    expect(labels).not.toContain("Users");
    expect(labels).not.toContain("Roles");
    expect(labels).not.toContain("Assignments");
    expect(labels).not.toContain("Audit");
  });
});
