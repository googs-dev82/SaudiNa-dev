import type {
  PortalAdminAssignment,
  PortalAdminUser,
  PortalArea,
  PortalCommittee,
  PortalRegion,
} from "@/features/portal/lib/api";
import { getUserRoleLabels, getUserScopeSummary } from "@/features/portal/lib/governance";

export interface UsersDirectoryFilters {
  query: string;
  status: string;
  role: string;
}

export interface UsersDirectoryDependencies {
  assignments: PortalAdminAssignment[];
  regions: PortalRegion[];
  areas: PortalArea[];
  committees: PortalCommittee[];
}

export interface UsersDirectoryEntry {
  user: PortalAdminUser;
  assignmentCount: number;
  roleCodes: string[];
  roleLabels: string[];
  scopeSummary: string[];
}

export function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function getUsersRoleOptions(assignments: PortalAdminAssignment[]) {
  return Array.from(new Set(assignments.map((assignment) => assignment.roleCode))).sort();
}

export function buildUsersDirectoryEntries(
  users: PortalAdminUser[],
  dependencies: UsersDirectoryDependencies,
): UsersDirectoryEntry[] {
  return users.map((user) => {
    const userAssignments = dependencies.assignments.filter(
      (assignment) => assignment.userId === user.id,
    );

    return {
      user,
      assignmentCount: userAssignments.length,
      roleCodes: Array.from(new Set(userAssignments.filter((assignment) => assignment.active).map((assignment) => assignment.roleCode))),
      roleLabels: getUserRoleLabels(user, dependencies.assignments),
      scopeSummary: getUserScopeSummary(user, dependencies.assignments, "en", {
        regions: dependencies.regions,
        areas: dependencies.areas,
        committees: dependencies.committees,
      }),
    };
  });
}

export function filterUsersDirectoryEntries(
  entries: UsersDirectoryEntry[],
  filters: UsersDirectoryFilters,
) {
  const query = filters.query.trim().toLowerCase();

  return entries.filter(({ user, roleCodes }) => {
    const matchesQuery =
      !query ||
      user.displayName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    const matchesStatus = filters.status === "ALL" || user.status === filters.status;
    const matchesRole =
      filters.role === "ALL" || roleCodes.some((role) => role === filters.role);

    return matchesQuery && matchesStatus && matchesRole;
  });
}
