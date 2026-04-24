import type { PortalLocale } from "./portal-locale";

// ─── Translation Dictionary ───────────────────────────────────────────────────

const translations = {
  // ── Shell & Navigation ────────────────────────────────────────────────────
  "portal.name": { ar: "بوابة سعودينا", en: "SaudiNA Portal" },
  "portal.tagline": { ar: "فضاء الحوكمة", en: "Governance workspace" },
  "portal.header.subtitle": {
    ar: "العمليات الحوكمية والإدارة القطاعية وسير العمل القابلة للتدقيق.",
    en: "Governed operations, scoped administration, and auditable workflows.",
  },
  "portal.header.search": {
    ar: "البحث عن مستخدمين، لجان، اجتماعات...",
    en: "Search users, committees, meetings...",
  },
  "portal.header.notifications": { ar: "الإشعارات", en: "Notifications" },
  "portal.sidebar.editorial.title": { ar: "السيادة التحريرية", en: "Editorial Sovereignty" },
  "portal.sidebar.editorial.desc": {
    ar: "عمليات داخلية وفق منظومة سعودينا الهادئة والراقية.",
    en: "Internal operations adapted to the same calm, premium SaudiNA system.",
  },
  "portal.sidebar.signedIn": { ar: "مسجّل الدخول", en: "Signed in" },
  "portal.sidebar.signOut": { ar: "تسجيل الخروج", en: "Sign out" },

  // ── Navigation Labels ─────────────────────────────────────────────────────
  "nav.group.workspace": { ar: "مساحة العمل", en: "Workspace" },
  "nav.group.operations": { ar: "العمليات", en: "Operations" },
  "nav.group.editorial": { ar: "التحرير", en: "Editorial" },
  "nav.group.oversight": { ar: "الإشراف", en: "Oversight" },
  "nav.group.governance": { ar: "الحوكمة", en: "Governance" },
  "nav.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },
  "nav.profile": { ar: "الملف الشخصي", en: "Profile" },
  "nav.myAssignments": { ar: "مهامي", en: "My assignments" },
  "nav.meetings": { ar: "اجتماعات التعافي", en: "Recovery meetings" },
  "nav.events": { ar: "الفعاليات", en: "Events" },
  "nav.inServiceMeetings": { ar: "اجتماعات الخدمة", en: "In-service meetings" },
  "nav.studio": { ar: "استوديو التحرير", en: "Editorial Studio" },
  "nav.reports": { ar: "التقارير", en: "Reports" },
  "nav.resources": { ar: "إدارة الموارد", en: "Resources admin" },
  "nav.contact": { ar: "الرسائل الواردة", en: "Contact submissions" },
  "nav.users": { ar: "المستخدمون", en: "Users" },
  "nav.roles": { ar: "الأدوار", en: "Roles" },
  "nav.assignments": { ar: "التعيينات", en: "Assignments" },
  "nav.regions": { ar: "المناطق", en: "Regions" },
  "nav.areas": { ar: "المناطق الفرعية", en: "Areas" },
  "nav.committees": { ar: "اللجان", en: "Committees" },
  "nav.audit": { ar: "سجل المراجعة", en: "Audit" },

  // ── Common actions ────────────────────────────────────────────────────────
  "action.confirm": { ar: "تأكيد", en: "Confirm" },
  "action.cancel": { ar: "إلغاء", en: "Cancel" },
  "action.save": { ar: "حفظ", en: "Save" },
  "action.create": { ar: "إنشاء", en: "Create" },
  "action.edit": { ar: "تعديل", en: "Edit" },
  "action.delete": { ar: "حذف", en: "Delete" },
  "action.activate": { ar: "تفعيل", en: "Activate" },
  "action.deactivate": { ar: "إيقاف", en: "Deactivate" },
  "action.view": { ar: "عرض", en: "View" },
  "action.viewDetails": { ar: "عرض التفاصيل", en: "View details" },
  "action.exportPDF": { ar: "تصدير PDF", en: "Export PDF" },
  "action.exportCSV": { ar: "تصدير CSV", en: "Export CSV" },
  "action.add": { ar: "إضافة", en: "Add" },
  "action.close": { ar: "إغلاق", en: "Close" },
  "action.search": { ar: "بحث", en: "Search" },
  "action.filter": { ar: "تصفية", en: "Filter" },
  "action.back": { ar: "رجوع", en: "Back" },
  "action.submit": { ar: "إرسال", en: "Submit" },

  // ── Common labels ─────────────────────────────────────────────────────────
  "label.status": { ar: "الحالة", en: "Status" },
  "label.active": { ar: "نشط", en: "Active" },
  "label.inactive": { ar: "غير نشط", en: "Inactive" },
  "label.name": { ar: "الاسم", en: "Name" },
  "label.nameAr": { ar: "الاسم بالعربية", en: "Name (Arabic)" },
  "label.nameEn": { ar: "الاسم بالإنجليزية", en: "Name (English)" },
  "label.code": { ar: "الرمز", en: "Code" },
  "label.createdAt": { ar: "تاريخ الإنشاء", en: "Created" },
  "label.updatedAt": { ar: "آخر تحديث", en: "Last updated" },
  "label.actions": { ar: "الإجراءات", en: "Actions" },
  "label.email": { ar: "البريد الإلكتروني", en: "Email" },
  "label.displayName": { ar: "الاسم المعروض", en: "Display name" },
  "label.role": { ar: "الدور", en: "Role" },
  "label.roles": { ar: "الأدوار", en: "Roles" },
  "label.region": { ar: "المنطقة", en: "Region" },
  "label.area": { ar: "المنطقة الفرعية", en: "Area" },
  "label.committee": { ar: "اللجنة", en: "Committee" },
  "label.level": { ar: "المستوى", en: "Level" },
  "label.scope": { ar: "النطاق", en: "Scope" },
  "label.noResults": { ar: "لا توجد نتائج", en: "No results" },
  "label.loading": { ar: "جارٍ التحميل...", en: "Loading..." },
  "label.language": { ar: "اللغة", en: "Language" },

  // ── Regions ───────────────────────────────────────────────────────────────
  "regions.title": { ar: "المناطق", en: "Regions" },
  "regions.description": {
    ar: "إدارة المناطق الجغرافية ضمن منظومة الحوكمة.",
    en: "Manage geographical regions within the governance structure.",
  },
  "regions.add": { ar: "إضافة منطقة", en: "Add region" },
  "regions.empty": { ar: "لا توجد مناطق بعد.", en: "No regions yet." },
  "regions.deactivate.title": { ar: "إيقاف هذه المنطقة؟", en: "Deactivate this region?" },
  "regions.deactivate.desc": {
    ar: "سيؤدي إيقاف هذه المنطقة إلى إخفاء مناطقها الفرعية ولجانها من الموقع العام.",
    en: "Deactivating this region will hide its areas and committees from the public site.",
  },
  "regions.delete.title": { ar: "حذف هذه المنطقة؟", en: "Delete this region?" },
  "regions.delete.desc": { ar: "هذا الإجراء لا يمكن التراجع عنه.", en: "This action cannot be undone." },
  "regions.actions.label": { ar: "إجراءات المنطقة", en: "Region actions" },

  // ── Areas ─────────────────────────────────────────────────────────────────
  "areas.title": { ar: "المناطق الفرعية", en: "Areas" },
  "areas.description": {
    ar: "إدارة المناطق الفرعية التابعة للمناطق الجغرافية.",
    en: "Manage areas within their parent regions.",
  },
  "areas.add": { ar: "إضافة منطقة فرعية", en: "Add area" },
  "areas.empty": { ar: "لا توجد مناطق فرعية بعد.", en: "No areas yet." },
  "areas.deactivate.title": { ar: "إيقاف هذه المنطقة الفرعية؟", en: "Deactivate this area?" },
  "areas.deactivate.desc": {
    ar: "سيؤدي إيقاف هذه المنطقة الفرعية إلى إخفاء لجانها من الموقع العام.",
    en: "Deactivating this area will hide its committees from the public site.",
  },
  "areas.delete.title": { ar: "حذف هذه المنطقة الفرعية؟", en: "Delete this area?" },
  "areas.delete.desc": { ar: "هذا الإجراء لا يمكن التراجع عنه.", en: "This action cannot be undone." },
  "areas.actions.label": { ar: "إجراءات المنطقة الفرعية", en: "Area actions" },

  // ── Committees ────────────────────────────────────────────────────────────
  "committees.title": { ar: "اللجان", en: "Committees" },
  "committees.description": {
    ar: "إدارة اللجان وهيكلها الحوكمي.",
    en: "Manage committees and their governance structure.",
  },
  "committees.add": { ar: "إضافة لجنة", en: "Add committee" },
  "committees.empty": { ar: "لا توجد لجان بعد.", en: "No committees yet." },
  "committees.deactivate.title": { ar: "إيقاف هذه اللجنة؟", en: "Deactivate this committee?" },
  "committees.deactivate.desc": {
    ar: "سيؤدي إيقاف هذه اللجنة إلى إخفائها من الموقع العام.",
    en: "Deactivating this committee will hide it from the public site.",
  },
  "committees.delete.title": { ar: "حذف هذه اللجنة؟", en: "Delete this committee?" },
  "committees.delete.desc": { ar: "هذا الإجراء لا يمكن التراجع عنه.", en: "This action cannot be undone." },
  "committees.actions.label": { ar: "إجراءات اللجنة", en: "Committee actions" },

  // ── Assignments ───────────────────────────────────────────────────────────
  "assignments.title": { ar: "التعيينات", en: "Assignments" },
  "assignments.description": {
    ar: "إدارة تعيينات الأدوار الوظيفية ونطاقات الصلاحيات.",
    en: "Manage role assignments and scope authorizations.",
  },
  "assignments.add": { ar: "إضافة تعيين", en: "Add assignment" },
  "assignments.empty": { ar: "لا توجد تعيينات بعد.", en: "No assignments yet." },
  "assignments.delete.title": { ar: "حذف هذا التعيين؟", en: "Delete this assignment?" },
  "assignments.delete.desc": {
    ar: "سيؤدي حذف هذا التعيين إلى إلغاء وصول المستخدم فوراً.",
    en: "Deleting this assignment will immediately revoke the user's access.",
  },
  "assignments.actions.label": { ar: "إجراءات التعيين", en: "Assignment actions" },

  // ── Users ─────────────────────────────────────────────────────────────────
  "users.title": { ar: "المستخدمون", en: "Users" },
  "users.description": {
    ar: "إدارة حسابات المستخدمين وصلاحياتهم.",
    en: "Manage user accounts and their access.",
  },
  "users.add": { ar: "إضافة مستخدم", en: "Add user" },
  "users.empty": { ar: "لا يوجد مستخدمون بعد.", en: "No users yet." },
  "users.deactivate.title": { ar: "إيقاف هذا المستخدم؟", en: "Deactivate this user?" },
  "users.deactivate.desc": {
    ar: "لن يتمكن المستخدم من الدخول إلى البوابة.",
    en: "The user will no longer be able to sign in to the portal.",
  },
  "users.delete.title": { ar: "حذف هذا المستخدم؟", en: "Delete this user?" },
  "users.delete.desc": {
    ar: "هذا الإجراء لا يمكن التراجع عنه وسيحذف جميع بياناته.",
    en: "This action cannot be undone and will permanently remove all their data.",
  },
  "users.actions.label": { ar: "إجراءات المستخدم", en: "User actions" },

  // ── Profile ───────────────────────────────────────────────────────────────
  "profile.title": { ar: "الملف الشخصي", en: "Profile" },
  "profile.subtitle": {
    ar: "بيانات الهوية المُسحوبة من جلسة المصادقة.",
    en: "Identity details pulled from the authenticated backend session.",
  },
  "profile.language.label": { ar: "لغة البوابة", en: "Portal language" },

  // ── Audit ─────────────────────────────────────────────────────────────────
  "audit.title": { ar: "سجل المراجعة", en: "Audit log" },
  "audit.description": {
    ar: "سجل كامل قابل للبحث لجميع الإجراءات الإدارية.",
    en: "A complete, searchable log of all administrative actions.",
  },

  // ── Breadcrumb root ───────────────────────────────────────────────────────
  "breadcrumb.portal": { ar: "البوابة", en: "Portal" },
} as const;

export type TranslationKey = keyof typeof translations;

// ─── t() helper ───────────────────────────────────────────────────────────────

/**
 * Returns the translation for the given key in the given locale.
 * Falls back to English if the Arabic translation is missing.
 */
export function t(key: TranslationKey, locale: PortalLocale): string {
  const entry = translations[key];
  return entry[locale] ?? entry["en"];
}

/**
 * Returns a bound translator function for a fixed locale.
 * Usage: const t = makeT("ar"); t("action.save")
 */
export function makeT(locale: PortalLocale) {
  return (key: TranslationKey) => t(key, locale);
}
