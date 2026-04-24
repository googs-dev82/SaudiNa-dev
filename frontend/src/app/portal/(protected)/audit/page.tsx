import { Badge } from "@/components/ui/badge";
import {
  GovernanceEmptyState,
  GovernanceListCard,
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import { PortalApiError, PortalAuditLog, getPortalAuditLogs } from "@/features/portal/lib/api";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

export default async function PortalAuditPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription: "يمكن للمشرفين العامين فقط الوصول إلى سجل المراجعة.",
          restrictedEmptyTitle: "الوصول إلى التدقيق غير متاح",
          restrictedEmptyDesc: "هذه الوحدة مخصصة لإشراف المشرف العام.",
          loadTitle: "تعذّر تحميل سجل المراجعة",
          loadEmptyTitle: "سجل التدقيق غير متاح",
          loadEmptyDesc: "لم تُرجع الواجهة الخلفية أحداث التدقيق لهذا الحساب.",
          eyebrow: "الإشراف",
          title: "سجل المراجعة",
          description:
            "سجل منظّم لأحداث الخلفية والأهداف والبيانات التشغيلية للمراجعة الجنائية.",
          events: "الأحداث",
          writes: "إجراءات الكتابة",
          actors: "الفاعلون",
          resources: "الموارد المتتبعة",
          streamTitle: "تدفق التدقيق",
          streamDesc: "تعرض كل بطاقة نوع الحدث والهدف والفاعل وأي بيانات تم التقاطها.",
          user: "المستخدم",
          method: "الطريقة",
          path: "المسار",
          correlation: "الارتباط",
        }
      : null;

  if (!canAccessPortalHref(user, "/portal/audit")) {
    return (
      <GovernanceSection
        title={copy?.restrictedTitle ?? "Access restricted"}
        description={copy?.restrictedDescription ?? "Only super administrators can access audit history."}
      >
        <GovernanceEmptyState
          title={copy?.restrictedEmptyTitle ?? "Audit access is unavailable"}
          description={copy?.restrictedEmptyDesc ?? "This module is reserved for Super Admin oversight."}
        />
      </GovernanceSection>
    );
  }

  let logs: PortalAuditLog[] = [];
  let errorMessage: string | null = null;

  try {
    logs = await getPortalAuditLogs();
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load audit logs from the backend.";
  }

  if (errorMessage) {
    return (
      <GovernanceSection title={copy?.loadTitle ?? "Unable to load audit logs"} description={errorMessage}>
        <GovernanceEmptyState
          title={copy?.loadEmptyTitle ?? "The audit trail is unavailable"}
          description={copy?.loadEmptyDesc ?? "The backend did not return audit events for this account."}
        />
      </GovernanceSection>
    );
  }

  const writeEvents = logs.filter((log) =>
    ["POST", "PATCH", "PUT", "DELETE"].includes(log.method ?? ""),
  ).length;

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy?.eyebrow ?? "Oversight"}
        title={copy?.title ?? "Audit"}
        description={copy?.description ?? "A governed event trail of backend actions, resource targets, and operational metadata for forensic review."}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy?.eyebrow ?? "Oversight", copy?.title ?? "Audit"]}
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard label={copy?.events ?? "Events"} value={logs.length} hint={locale === "ar" ? "أحداث التدقيق الظاهرة التي أرجعها الخادم." : "Visible audit events returned by the backend."} />
        <GovernanceMetricCard label={copy?.writes ?? "Write actions"} value={writeEvents} hint={locale === "ar" ? "أنشطة POST وPATCH وPUT وDELETE في مجموعة النتائج الحالية." : "POST, PATCH, PUT, and DELETE activity in the current result set."} />
        <GovernanceMetricCard label={copy?.actors ?? "Actors"} value={new Set(logs.map((log) => log.userId).filter(Boolean)).size} hint={locale === "ar" ? "معرّفات المستخدمين المميزة الممثلة في الأحداث المعروضة." : "Distinct user IDs represented in the returned events."} />
        <GovernanceMetricCard label={copy?.resources ?? "Tracked resources"} value={new Set(logs.map((log) => log.resourceType)).size} hint={locale === "ar" ? "مجالات الموارد المختلفة الظاهرة في تدفق التدقيق." : "Different resource domains appearing in the audit stream."} />
      </GovernanceMetricGrid>

      <GovernanceSection
        title={copy?.streamTitle ?? "Audit stream"}
        description={copy?.streamDesc ?? "Each card surfaces the event type, resource target, actor snapshot, and any captured metadata."}
      >
      <div className="grid gap-6">
        {logs.map((log) => (
          <GovernanceListCard
            key={log.id}
            title={log.action}
            subtitle={`${log.resourceType}${log.resourceId ? ` · ${log.resourceId}` : ""}`}
            badges={
              <>
                <Badge>{log.timestamp.slice(0, 19).replace("T", " ")}</Badge>
                {log.userRoleSnapshot ? (
                  <Badge className="bg-accent text-accent-foreground">
                    {log.userRoleSnapshot}
                  </Badge>
                ) : null}
              </>
            }
          >
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <p>
                <span className="font-semibold text-primary">{copy?.user ?? "User"}:</span>{" "}
                {log.userId ?? "Unknown"}
              </p>
              <p>
                <span className="font-semibold text-primary">{copy?.method ?? "Method"}:</span>{" "}
                {log.method ?? "N/A"}
              </p>
              <p>
                <span className="font-semibold text-primary">{copy?.path ?? "Path"}:</span>{" "}
                {log.path ?? "N/A"}
              </p>
              <p>
                <span className="font-semibold text-primary">{copy?.correlation ?? "Correlation"}:</span>{" "}
                {log.correlationId ?? "N/A"}
              </p>
            </div>

            {log.metadata ? (
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Metadata: {JSON.stringify(log.metadata)}
              </p>
            ) : null}
          </GovernanceListCard>
        ))}
      </div>
      </GovernanceSection>
    </div>
  );
}
