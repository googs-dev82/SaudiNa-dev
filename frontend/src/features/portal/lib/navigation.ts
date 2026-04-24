import type { PortalRole, PortalUser } from "@/types/portal";
import type { PortalLocale } from "@/features/portal/lib/portal-locale";
import { hasAnyRole, hasPrCommitteeAccess } from "./session";

export type PortalNavIcon =
  | "layout-dashboard"
  | "user-circle"
  | "clipboard-list"
  | "calendar-range"
  | "calendar-clock"
  | "calendar-star"
  | "edit"
  | "file-text"
  | "folder-kanban"
  | "mail"
  | "map"
  | "users"
  | "shield"
  | "key-round"
  | "map-pinned"
  | "building-2";

export interface PortalNavItem {
  href: string;
  label: string;
  description: string;
  icon: PortalNavIcon;
  group: string;
}

interface PortalNavDefinition {
  href: string;
  label: Record<PortalLocale, string>;
  description: Record<PortalLocale, string>;
  icon: PortalNavIcon;
  group: Record<PortalLocale, string>;
  visible: (user: PortalUser) => boolean;
}

const withRoles =
  (roles: PortalRole[]) =>
  (user: PortalUser) =>
    hasAnyRole(user, roles);

export const portalNavItems: PortalNavDefinition[] = [
  {
    href: "/portal",
    label: { ar: "لوحة التحكم", en: "Dashboard" },
    description: {
      ar: "صفحة افتتاحية تراعي الدور وتعرض مساحة العمل التشغيلية.",
      en: "Role-aware landing page for the operational workspace.",
    },
    icon: "layout-dashboard",
    group: { ar: "مساحة العمل", en: "Workspace" },
    visible: () => true,
  },
  {
    href: "/portal/profile",
    label: { ar: "الملف الشخصي", en: "Profile" },
    description: {
      ar: "الهوية والأدوار الفعالة وملخص الحساب.",
      en: "Identity, active roles, and account summary.",
    },
    icon: "user-circle",
    group: { ar: "مساحة العمل", en: "Workspace" },
    visible: () => true,
  },
  {
    href: "/portal/meetings/recovery",
    label: { ar: "اجتماعات التعافي", en: "Recovery meetings" },
    description: {
      ar: "إدارة سجلات اجتماعات التعافي العامة حسب النطاق المسموح.",
      en: "Manage public recovery meeting records by permitted scope.",
    },
    icon: "calendar-range",
    group: { ar: "العمليات", en: "Operations" },
    visible: withRoles(["SUPER_ADMIN", "AREA_MANAGER", "MEETING_EDITOR"]),
  },
  {
    href: "/portal/events",
    label: { ar: "الفعاليات", en: "Events" },
    description: {
      ar: "إدارة الفعاليات العامة والخاصة مع حجوزات Zoom المفعلة.",
      en: "Manage public and private events plus Zoom-enabled booking flows.",
    },
    icon: "calendar-star",
    group: { ar: "العمليات", en: "Operations" },
    visible: withRoles(["SUPER_ADMIN", "REGIONAL_MANAGER", "AREA_MANAGER", "MEETING_EDITOR", "CONTENT_EDITOR"]),
  },
  {
    href: "/portal/meetings/in-service",
    label: { ar: "اجتماعات الخدمة", en: "In-service meetings" },
    description: {
      ar: "إنشاء ومراجعة واعتماد سير اجتماعات اللجان الداخلية.",
      en: "Create, review, or approve internal committee meeting workflows.",
    },
    icon: "calendar-clock",
    group: { ar: "العمليات", en: "Operations" },
    visible: withRoles(["SUPER_ADMIN", "COMMITTEE_MANAGER", "COMMITTEE_SECRETARY"]),
  },
  {
    href: "/portal/studio",
    label: { ar: "استوديو التحرير", en: "Editorial Studio" },
    description: {
      ar: "فتح مساحة Sanity المؤمنة لإدارة المحتوى التحريري.",
      en: "Open the secured Sanity workspace for editorial content management.",
    },
    icon: "edit",
    group: { ar: "التحرير", en: "Editorial" },
    visible: withRoles(["SUPER_ADMIN", "CONTENT_EDITOR"]),
  },
  {
    href: "/portal/reports",
    label: { ar: "التقارير", en: "Reports" },
    description: {
      ar: "إنشاء ومراجعة التقارير التشغيلية حسب النطاق.",
      en: "Generate and review scoped operational reports.",
    },
    icon: "file-text",
    group: { ar: "الإشراف", en: "Oversight" },
    visible: withRoles(["SUPER_ADMIN", "REGIONAL_MANAGER", "AREA_MANAGER"]),
  },
  {
    href: "/portal/resources",
    label: { ar: "إدارة الموارد", en: "Resources admin" },
    description: {
      ar: "إدارة سجلات الموارد والمحتوى الداعم للنشر.",
      en: "Maintain editorial resource records and publishing support content.",
    },
    icon: "folder-kanban",
    group: { ar: "التحرير", en: "Editorial" },
    visible: withRoles(["SUPER_ADMIN", "CONTENT_EDITOR"]),
  },
  {
    href: "/portal/contact",
    label: { ar: "الرسائل الواردة", en: "Contact submissions" },
    description: {
      ar: "مراجعة واستقبال الاستفسارات والدعم للمشغلين المصرح لهم.",
      en: "Review and triage support enquiries for authorized operators.",
    },
    icon: "mail",
    group: { ar: "الإشراف", en: "Oversight" },
    visible: (user) => hasPrCommitteeAccess(user),
  },
  {
    href: "/portal/admin/users",
    label: { ar: "المستخدمون", en: "Users" },
    description: {
      ar: "إدارة هويات المنصة وحالة الملف والحسابات المرتبطة بمزود الخدمة.",
      en: "Manage platform identities, profile status, and provider-linked accounts.",
    },
    icon: "users",
    group: { ar: "الحوكمة", en: "Governance" },
    visible: withRoles(["SUPER_ADMIN"]),
  },
  {
    href: "/portal/admin/roles",
    label: { ar: "الأدوار", en: "Roles" },
    description: {
      ar: "مرجع نموذج الأدوار وقواعد النطاق وأهداف الحوكمة.",
      en: "Reference the platform role model, scope rules, and governance intent.",
    },
    icon: "key-round",
    group: { ar: "الحوكمة", en: "Governance" },
    visible: withRoles(["SUPER_ADMIN"]),
  },
  {
    href: "/portal/admin/assignments",
    label: { ar: "التعيينات", en: "Assignments" },
    description: {
      ar: "إدارة تعيينات الأدوار إلى النطاقات عبر المستخدمين والهياكل.",
      en: "Manage role-to-scope assignments across users and structures.",
    },
    icon: "clipboard-list",
    group: { ar: "الحوكمة", en: "Governance" },
    visible: withRoles(["SUPER_ADMIN"]),
  },
  {
    href: "/portal/admin/regions",
    label: { ar: "المناطق", en: "Regions" },
    description: {
      ar: "إدارة الهيكل الإقليمي الذي يحدد النطاق التشغيلي.",
      en: "Govern the regional structure that anchors operational scope.",
    },
    icon: "map",
    group: { ar: "الحوكمة", en: "Governance" },
    visible: withRoles(["SUPER_ADMIN"]),
  },
  {
    href: "/portal/admin/areas",
    label: { ar: "المناطق الفرعية", en: "Areas" },
    description: {
      ar: "إدارة المناطق الفرعية والمناطق الأم والنطاق الجغرافي التشغيلي.",
      en: "Maintain area records, parent regions, and active operational geography.",
    },
    icon: "map-pinned",
    group: { ar: "الحوكمة", en: "Governance" },
    visible: withRoles(["SUPER_ADMIN"]),
  },
  {
    href: "/portal/admin/committees",
    label: { ar: "اللجان", en: "Committees" },
    description: {
      ar: "إدارة اللجان الإقليمية ولجان المناطق وهيكلها الحوكمي.",
      en: "Maintain regional and area committees plus their governed parent structure.",
    },
    icon: "building-2",
    group: { ar: "الحوكمة", en: "Governance" },
    visible: withRoles(["SUPER_ADMIN"]),
  },
  {
    href: "/portal/audit",
    label: { ar: "سجل المراجعة", en: "Audit" },
    description: {
      ar: "عرض نشاط المراجعة والحوكمة المصرح به.",
      en: "View privileged audit and governance activity.",
    },
    icon: "shield",
    group: { ar: "الإشراف", en: "Oversight" },
    visible: withRoles(["SUPER_ADMIN"]),
  },
];

export function canAccessPortalHref(user: PortalUser, href: string) {
  const item = portalNavItems.find((navItem) => navItem.href === href);
  return item ? item.visible(user) : false;
}

export function getVisiblePortalNavItems(user: PortalUser, locale: PortalLocale = "en") {
  return portalNavItems
    .filter((item) => item.visible(user))
    .map((item) => ({
      href: item.href,
      label: item.label[locale],
      description: item.description[locale],
      icon: item.icon,
      group: item.group[locale],
    }));
}
