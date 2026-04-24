import type {
  PortalAdminAssignment,
  PortalAdminUser,
  PortalArea,
  PortalCommittee,
  PortalRegion,
} from "@/features/portal/lib/api";
import type { PortalLocale } from "@/features/portal/lib/portal-locale";
import type { PortalRole } from "@/types/portal";

export interface RoleDefinition {
  code: PortalRole;
  label: string;
  description: string;
  scopeType: "GLOBAL" | "REGION" | "AREA" | "COMMITTEE";
  governanceNote: string;
}

export const roleDefinitions: RoleDefinition[] = [
  {
    code: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full governance control across users, structures, content, audit, and operations.",
    scopeType: "GLOBAL",
    governanceNote: "Reserved for a minimal number of trusted platform stewards.",
  },
  {
    code: "REGIONAL_MANAGER",
    label: "Regional Manager",
    description: "Reviews and operates reports and governed workflows within an assigned region.",
    scopeType: "REGION",
    governanceNote: "Best for regional oversight and report visibility.",
  },
  {
    code: "AREA_MANAGER",
    label: "Area Manager",
    description: "Leads area-level workflows and can access area-scoped reporting and operations.",
    scopeType: "AREA",
    governanceNote: "Area scope should reflect a single operational geography.",
  },
  {
    code: "COMMITTEE_MANAGER",
    label: "Committee Manager",
    description: "Approves committee workflows and manages governed committee activity.",
    scopeType: "COMMITTEE",
    governanceNote: "Used for maker-checker approval at committee level.",
  },
  {
    code: "COMMITTEE_SECRETARY",
    label: "Committee Secretary",
    description: "Creates and maintains in-service meeting records for an assigned committee.",
    scopeType: "COMMITTEE",
    governanceNote: "Cannot approve their own committee workflow submissions.",
  },
  {
    code: "MEETING_EDITOR",
    label: "Meeting Editor",
    description: "Maintains recovery meeting records within the assigned area scope.",
    scopeType: "AREA",
    governanceNote: "Best for localized meeting stewardship and publishing preparation.",
  },
  {
    code: "CONTENT_EDITOR",
    label: "Content Editor",
    description: "Maintains editorial CMS content and resources within the governed content boundary.",
    scopeType: "GLOBAL",
    governanceNote: "Studio access remains limited to content, never operational data.",
  },
];

export function getRoleDefinition(roleCode: string) {
  return roleDefinitions.find((role) => role.code === roleCode);
}

const roleLabelOverrides: Record<PortalLocale, Partial<Record<PortalRole, string>>> = {
  ar: {
    SUPER_ADMIN: "مشرف عام",
    REGIONAL_MANAGER: "مدير إقليمي",
    AREA_MANAGER: "مدير منطقة",
    COMMITTEE_MANAGER: "مدير لجنة",
    COMMITTEE_SECRETARY: "أمين لجنة",
    MEETING_EDITOR: "محرر الاجتماعات",
    CONTENT_EDITOR: "محرر المحتوى",
  },
  en: {},
};

export function formatRoleLabel(roleCode: string, locale: PortalLocale = "en") {
  return (
    roleLabelOverrides[locale][roleCode as PortalRole] ??
    getRoleDefinition(roleCode)?.label ??
    roleCode.replaceAll("_", " ")
  );
}

export function formatDateLabel(value?: string | null, locale: PortalLocale = "en") {
  if (!value) {
    return locale === "ar" ? "غير محدد" : "Not set";
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatDateTimeLabel(value?: string | null, locale: PortalLocale = "en") {
  if (!value) {
    return locale === "ar" ? "غير متاح" : "Not available";
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Riyadh",
  }).format(new Date(value));
}

export function getAssignmentScopeLabel(
  assignment: Pick<PortalAdminAssignment, "scopeType" | "scopeCode" | "scopeId">,
  locale: PortalLocale = "en",
  options?: {
    regions?: PortalRegion[];
    areas?: PortalArea[];
    committees?: PortalCommittee[];
  },
) {
  if (assignment.scopeType === "GLOBAL") {
    return locale === "ar" ? "صلاحية شاملة" : "Global access";
  }

  if (assignment.scopeType === "REGION") {
    const region = options?.regions?.find((entry) => entry.id === assignment.scopeId);
    return region
      ? `${region.nameEn} (${region.code})`
      : assignment.scopeCode ?? assignment.scopeId ?? (locale === "ar" ? "منطقة غير معروفة" : "Unknown region");
  }

  if (assignment.scopeType === "AREA") {
    const area = options?.areas?.find((entry) => entry.id === assignment.scopeId);
    return area
      ? `${area.nameEn} (${area.code})`
      : assignment.scopeCode ?? assignment.scopeId ?? (locale === "ar" ? "منطقة فرعية غير معروفة" : "Unknown area");
  }

  if (assignment.scopeType === "COMMITTEE") {
    const committee = options?.committees?.find((entry) => entry.id === assignment.scopeId);
    return committee
      ? `${committee.nameEn} (${committee.code})`
      : assignment.scopeCode ?? assignment.scopeId ?? (locale === "ar" ? "لجنة غير معروفة" : "Unknown committee");
  }

  return assignment.scopeCode ?? assignment.scopeId ?? (locale === "ar" ? "غير مسند" : "Not assigned");
}

export function getUserRoleLabels(
  user: Pick<PortalAdminUser, "id">,
  assignments: PortalAdminAssignment[],
  locale: PortalLocale = "en",
) {
  return Array.from(
    new Set(
      assignments
        .filter((assignment) => assignment.userId === user.id && assignment.active)
        .map((assignment) => formatRoleLabel(assignment.roleCode, locale)),
    ),
  );
}

export function getUserScopeSummary(
  user: Pick<PortalAdminUser, "id">,
  assignments: PortalAdminAssignment[],
  locale: PortalLocale = "en",
  options?: {
    regions?: PortalRegion[];
    areas?: PortalArea[];
    committees?: PortalCommittee[];
  },
) {
  const activeAssignments = assignments.filter(
    (assignment) => assignment.userId === user.id && assignment.active,
  );

  if (activeAssignments.length === 0) {
    return [];
  }

  return activeAssignments.map((assignment) =>
    getAssignmentScopeLabel(assignment, locale, options),
  );
}
