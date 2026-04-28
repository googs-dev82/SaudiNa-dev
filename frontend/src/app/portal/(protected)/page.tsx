import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Inbox,
  Layers3,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatRoleLabel } from "@/features/portal/lib/governance";
import { canAccessPortalHref, getVisiblePortalNavItems } from "@/features/portal/lib/navigation";
import {
  getPortalAuditLogs,
  getPortalContactSubmissions,
  getPortalEvents,
  getPortalInServiceMeetings,
  getPortalRecoveryMeetings,
  getPortalReports,
  getPortalResources,
  getPortalUsers,
  type PortalAuditLog,
  type PortalContactSubmission,
  type PortalEvent,
  type PortalInServiceMeeting,
  type PortalRecoveryMeeting,
  type PortalReport,
  type PortalResource,
} from "@/features/portal/lib/api";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";
import { portalIconMap } from "@/features/portal/lib/icon-map";

type DashboardSnapshot = {
  recoveryMeetings: PortalRecoveryMeeting[];
  inServiceMeetings: PortalInServiceMeeting[];
  events: PortalEvent[];
  reports: PortalReport[];
  resources: PortalResource[];
  contactSubmissions: PortalContactSubmission[];
  auditLogs: PortalAuditLog[];
  users: unknown[];
};

async function safeLoad<T>(loader: () => Promise<T>, fallback: T) {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

export default async function PortalHomePage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const modules = getVisiblePortalNavItems(user, locale).filter((item) => item.href !== "/portal");
  const isArabic = locale === "ar";
  const copy = isArabic
    ? {
        welcome: "مرحباً",
        title: `أهلاً ${user.displayName}`,
        subtitle: "لوحة تشغيل موحدة تعرض ما يحتاج انتباهك اليوم، وروابط العمل الأكثر أهمية حسب صلاحياتك.",
        primaryAction: "ابدأ من الاجتماعات",
        roles: "الأدوار الفعالة",
        scope: "نطاق العمل",
        modules: "وحدات متاحة",
        attention: "بانتظار الإجراء",
        attentionEmpty: "لا توجد عناصر حرجة الآن.",
        shortcuts: "مساحات العمل",
        recent: "آخر النشاط",
        recentEmpty: "لا يوجد نشاط حديث ظاهر لهذا الحساب.",
        viewAll: "عرض الكل",
        publishedMeetings: "اجتماعات منشورة",
        servicePending: "خدمة بانتظار الاعتماد",
        upcomingEvents: "فعاليات قادمة",
        openMessages: "رسائل مفتوحة",
        activeUsers: "مستخدمون نشطون",
        resources: "موارد منشورة",
        pendingReports: "تقارير معلقة",
        governedAccess: "صلاحيات محكومة",
      }
    : {
        welcome: "Welcome",
        title: `Welcome, ${user.displayName}`,
        subtitle: "A unified operations dashboard showing what needs attention today and the workspaces available to your role.",
        primaryAction: "Start with meetings",
        roles: "Active roles",
        scope: "Operational scope",
        modules: "Available modules",
        attention: "Needs attention",
        attentionEmpty: "No critical items need attention right now.",
        shortcuts: "Workspaces",
        recent: "Recent activity",
        recentEmpty: "No recent activity is visible for this account.",
        viewAll: "View all",
        publishedMeetings: "Published meetings",
        servicePending: "Service pending",
        upcomingEvents: "Upcoming events",
        openMessages: "Open messages",
        activeUsers: "Active users",
        resources: "Published resources",
        pendingReports: "Pending reports",
        governedAccess: "Governed access",
      };

  const snapshot: DashboardSnapshot = {
    recoveryMeetings: canAccessPortalHref(user, "/portal/meetings/recovery")
      ? await safeLoad(getPortalRecoveryMeetings, [])
      : [],
    inServiceMeetings: canAccessPortalHref(user, "/portal/meetings/in-service")
      ? await safeLoad(getPortalInServiceMeetings, [])
      : [],
    events: canAccessPortalHref(user, "/portal/events")
      ? await safeLoad(getPortalEvents, [])
      : [],
    reports: canAccessPortalHref(user, "/portal/reports")
      ? await safeLoad(getPortalReports, [])
      : [],
    resources: canAccessPortalHref(user, "/portal/resources")
      ? await safeLoad(getPortalResources, [])
      : [],
    contactSubmissions: canAccessPortalHref(user, "/portal/contact")
      ? await safeLoad(getPortalContactSubmissions, [])
      : [],
    auditLogs: canAccessPortalHref(user, "/portal/audit")
      ? await safeLoad(getPortalAuditLogs, [])
      : [],
    users: canAccessPortalHref(user, "/portal/admin/users")
      ? await safeLoad(getPortalUsers, [])
      : [],
  };

  const now = new Date();
  const upcomingEvents = snapshot.events.filter((event) => new Date(`${event.date}T${event.startTime || "00:00"}`) >= now).length;
  const pendingServiceMeetings = snapshot.inServiceMeetings.filter((meeting) => meeting.status === "PENDING").length;
  const openMessages = snapshot.contactSubmissions.filter((submission) => submission.status !== "RESOLVED").length;
  const pendingReports = snapshot.reports.filter((report) => report.status === "PENDING").length;
  const primaryHref = canAccessPortalHref(user, "/portal/meetings/recovery")
    ? "/portal/meetings/recovery"
    : modules[0]?.href ?? "/portal/profile";

  const metrics = [
    {
      label: copy.publishedMeetings,
      value: snapshot.recoveryMeetings.filter((meeting) => meeting.status === "PUBLISHED").length,
      href: "/portal/meetings/recovery",
      icon: CalendarDays,
      visible: canAccessPortalHref(user, "/portal/meetings/recovery"),
    },
    {
      label: copy.servicePending,
      value: pendingServiceMeetings,
      href: "/portal/meetings/in-service",
      icon: CalendarClock,
      visible: canAccessPortalHref(user, "/portal/meetings/in-service"),
    },
    {
      label: copy.upcomingEvents,
      value: upcomingEvents,
      href: "/portal/events",
      icon: ClipboardList,
      visible: canAccessPortalHref(user, "/portal/events"),
    },
    {
      label: copy.openMessages,
      value: openMessages,
      href: "/portal/contact",
      icon: Inbox,
      visible: canAccessPortalHref(user, "/portal/contact"),
    },
    {
      label: copy.activeUsers,
      value: snapshot.users.length,
      href: "/portal/admin/users",
      icon: UsersRound,
      visible: canAccessPortalHref(user, "/portal/admin/users"),
    },
    {
      label: copy.resources,
      value: snapshot.resources.filter((resource) => resource.isPublic).length,
      href: "/portal/resources",
      icon: FileText,
      visible: canAccessPortalHref(user, "/portal/resources"),
    },
  ].filter((item) => item.visible).slice(0, 4);

  const attentionItems = [
    ...snapshot.inServiceMeetings
      .filter((meeting) => meeting.status === "PENDING")
      .slice(0, 3)
      .map((meeting) => ({
        title: isArabic ? meeting.titleAr : meeting.titleEn,
        eyebrow: copy.servicePending,
        href: "/portal/meetings/in-service",
      })),
    ...snapshot.contactSubmissions
      .filter((submission) => submission.status !== "RESOLVED")
      .slice(0, 2)
      .map((submission) => ({
        title: submission.subject,
        eyebrow: copy.openMessages,
        href: "/portal/contact",
      })),
    ...snapshot.reports
      .filter((report) => report.status === "PENDING")
      .slice(0, 2)
      .map((report) => ({
        title: report.type,
        eyebrow: copy.pendingReports,
        href: "/portal/reports",
      })),
  ].slice(0, 5);

  const recentActivity = snapshot.auditLogs.slice(0, 5).map((log) => ({
    title: log.action,
    meta: `${log.resourceType}${log.resourceId ? ` • ${log.resourceId.slice(0, 8)}` : ""}`,
    time: formatDateTime(log.timestamp, locale),
  }));

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-secondary/15 bg-[linear-gradient(135deg,#315c3f_0%,#588157_100%)] text-white shadow-sm">
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/75">{copy.welcome}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">{copy.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge key={role} className="border border-white/20 bg-white/14 text-white hover:bg-white/18">
                  {formatRoleLabel(role, locale)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex min-w-64 flex-col justify-between rounded-lg border border-white/16 bg-white/12 p-5 backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{copy.governedAccess}</p>
              <p className="mt-2 text-4xl font-semibold">{modules.length}</p>
              <p className="mt-1 text-sm text-white/75">{copy.modules}</p>
            </div>
            <Link className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-white/92" href={primaryHref}>
              {copy.primaryAction}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-lg border border-secondary/15 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">{copy.attention}</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{copy.attention}</h2>
            </div>
            <CheckCircle2 className="size-6 text-secondary" />
          </div>
          {attentionItems.length ? (
            <div className="divide-y divide-secondary/10">
              {attentionItems.map((item, index) => (
                <Link key={`${item.href}-${item.title}-${index}`} className="flex items-center justify-between gap-4 py-4 transition hover:text-secondary" href={item.href}>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">{item.eyebrow}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-foreground">{item.title}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-secondary" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-secondary/25 bg-secondary/5 p-8 text-center">
              <CheckCircle2 className="mx-auto size-8 text-secondary" />
              <p className="mt-3 text-sm font-medium text-foreground">{copy.attentionEmpty}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-secondary/15 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">{copy.scope}</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{copy.roles}</h2>
          </div>
          <div className="space-y-3">
            {user.assignments.length ? (
              user.assignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="rounded-lg border border-secondary/10 bg-secondary/5 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{formatRoleLabel(assignment.roleCode, locale)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {assignment.scopeCode ?? assignment.scopeType}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-secondary/10 bg-secondary/5 px-4 py-3 text-sm text-muted-foreground">
                {copy.governedAccess}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <div className="rounded-lg border border-secondary/15 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Layers3 className="size-5 text-secondary" />
            <h2 className="text-xl font-semibold text-foreground">{copy.shortcuts}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {modules.slice(0, 8).map((module) => {
              const Icon = portalIconMap[module.icon];
              return (
                <Link key={module.href} href={module.href} className="group rounded-lg border border-secondary/10 bg-background p-4 transition hover:-translate-y-0.5 hover:border-secondary/35 hover:bg-secondary/5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">{module.label}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{module.description}</p>
                    </div>
                    <ArrowUpRight className="ms-auto size-4 shrink-0 text-muted-foreground transition group-hover:text-secondary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-secondary/15 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <ShieldCheck className="size-5 text-secondary" />
            <h2 className="text-xl font-semibold text-foreground">{copy.recent}</h2>
          </div>
          {recentActivity.length ? (
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-lg border border-secondary/10 bg-secondary/5 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
                  <p className="mt-2 text-[11px] font-medium text-secondary">{item.time}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-secondary/25 bg-secondary/5 p-8 text-center text-sm text-muted-foreground">
              {copy.recentEmpty}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href} className="group rounded-lg border border-secondary/15 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/35 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
          <Icon className="size-5" />
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-secondary" />
      </div>
      <p className="mt-5 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Link>
  );
}

function formatDateTime(value: string, locale: "ar" | "en") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Riyadh",
  }).format(date);
}
