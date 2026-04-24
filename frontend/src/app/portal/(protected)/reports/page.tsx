import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import {
  GovernanceEmptyState,
  GovernanceListCard,
  GovernanceMetaGrid,
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import { PortalApiError, PortalReport, getPortalReports } from "@/features/portal/lib/api";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import {
  approvePortalReportAction,
  createPortalReportAction,
  runPortalReportAction,
  submitPortalReportAction,
} from "@/features/portal/lib/mutations";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

const reportTypes = [
  "MEETING_SUMMARY",
  "ACTIVITY_REPORT",
  "USER_ACTIVITY",
  "AUDIT_TRAIL_EXTRACT",
  "RESOURCE_USAGE",
] as const;

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-SA", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function reportStatusTone(status: string) {
  switch (status) {
    case "READY":
      return "bg-emerald-100 text-emerald-800";
    case "FAILED":
      return "bg-rose-100 text-rose-800";
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    case "GENERATING":
      return "bg-sky-100 text-sky-800";
    case "APPROVED":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function PortalReportsPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription: "الأدوار النشطة الحالية لا تمنحك صلاحية الوصول إلى التقارير.",
          restrictedEmptyTitle: "إدارة التقارير غير متاحة",
          restrictedEmptyDesc: "المديرون والمشرف العام فقط يمكنهم طلب التقارير أو اعتمادها أو تشغيلها.",
          loadTitle: "تعذّر تحميل التقارير",
          loadEmptyTitle: "خدمة التقارير غير متاحة",
          loadEmptyDesc: "لم تُرجع الواجهة الخلفية مهام التقارير لهذا الحساب.",
          eyebrow: "العمليات",
          title: "التقارير",
          description:
            "اطلب مهام التقارير وراجعها واعتمدها وشغّلها مع حالة سير عمل واضحة وحوكمة تراعي النطاق.",
          jobs: "المهام",
          pending: "قيد الانتظار",
          ready: "جاهزة",
          gated: "معتمدة بالموافقة",
          createTitle: "إنشاء تقرير",
          createDesc: "اطلب مهمة تقرير مع عوامل تصفية منظمة وسلوك موافقة واضح.",
          createHeading: "إنشاء تقرير",
          filtersHint: "يجب أن تكون عوامل التصفية JSON صالحًا. مثال:",
          approvalRequired: "مطلوب اعتماد قبل التشغيل",
          createButton: "إنشاء تقرير",
          noneTitle: "لا توجد تقارير بعد",
          noneDesc: "لم يُرجع الخادم أي تقارير لهذا الحساب.",
          emptyTitle: "لا توجد مهام تقارير ضمن النطاق",
          emptyDesc: "أنشئ أول طلب تقرير لبدء سير العمل.",
          queueTitle: "طابور التقارير",
          queueDesc: "كل بطاقة تعرض البيانات الوصفية والعوامل وحالة سير العمل والإجراءات المتاحة في مكان واحد.",
          approvalBadge: "يتطلب موافقة",
          created: "أُنشئ",
          updated: "آخر تحديث",
          createdBy: "أنشأه",
          approvedBy: "اعتمد بواسطة",
          filters: "العوامل",
          generatedFile: "الملف المنشأ",
          none: "لا يوجد",
          noFile: "لم يتم إنشاء ملف بعد",
          submitForApproval: "إرسال التقرير للموافقة؟",
          submitDesc: "سيُرسل هذا الطلب إلى الاعتماد قبل بدء الإنشاء.",
          submitButton: "إرسال",
          approveTitle: "اعتماد هذا التقرير؟",
          approveDesc: "سيتيح الاعتماد تشغيل التقرير لهذا الطلب.",
          approveButton: "اعتماد",
          runTitle: "إنشاء هذا التقرير الآن؟",
          runDesc: "سيبدأ تشغيل التقرير باستخدام النطاق والعوامل المحفوظة.",
          runButton: "تشغيل التقرير",
        }
      : null;

  if (!canAccessPortalHref(user, "/portal/reports")) {
    return (
      <GovernanceSection
        title={copy?.restrictedTitle ?? "Access restricted"}
        description={copy?.restrictedDescription ?? "Your active roles do not currently allow access to reports."}
      >
        <GovernanceEmptyState
          title={copy?.restrictedEmptyTitle ?? "Report governance is unavailable"}
          description={copy?.restrictedEmptyDesc ?? "Managers and Super Admins are the only roles that can request, approve, or run reports."}
        />
      </GovernanceSection>
    );
  }

  let reports: PortalReport[] = [];
  let errorMessage: string | null = null;

  try {
    reports = await getPortalReports();
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load reports from the backend.";
  }

  if (errorMessage) {
    return (
      <GovernanceSection title={copy?.loadTitle ?? "Unable to load reports"} description={errorMessage}>
        <GovernanceEmptyState
          title={copy?.loadEmptyTitle ?? "The reporting service is unavailable"}
          description={copy?.loadEmptyDesc ?? "The backend did not return report jobs for the current account."}
        />
      </GovernanceSection>
    );
  }

  const approvalRequired = reports.filter((report) => report.approvalRequired).length;
  const readyReports = reports.filter((report) => report.status === "READY").length;
  const pendingReports = reports.filter((report) => report.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy?.eyebrow ?? "Operations"}
        title={copy?.title ?? "Reports"}
        description={copy?.description ?? "Request, review, approve, and run report jobs with clear workflow state and scope-aware governance."}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy?.eyebrow ?? "Operations", copy?.title ?? "Reports"]}
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard label={copy?.jobs ?? "Jobs"} value={reports.length} hint={locale === "ar" ? "سجلات التقارير الظاهرة لهذا الحساب." : "Report records currently visible to this account."} />
        <GovernanceMetricCard label={copy?.pending ?? "Pending"} value={pendingReports} hint={locale === "ar" ? "تقارير تنتظر الموافقة أو الخطوة التالية." : "Reports waiting for approval or the next workflow step."} />
        <GovernanceMetricCard label={copy?.ready ?? "Ready"} value={readyReports} hint={locale === "ar" ? "تقارير جاهزة بملفات مُنشأة." : "Reports with generated files ready for access."} />
        <GovernanceMetricCard label={copy?.gated ?? "Approval gated"} value={approvalRequired} hint={locale === "ar" ? "مهام تقارير تتطلب موافقة قبل التشغيل." : "Report jobs that require maker-checker approval before run."} />
      </GovernanceMetricGrid>

      <GovernanceSection
        title={copy?.createTitle ?? "Create report"}
        description={copy?.createDesc ?? "Request a report job with structured filters and explicit approval behavior."}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-primary">{copy?.createHeading ?? "Create report"}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {copy?.filtersHint ?? "Filters should be valid JSON. Example:"}
              <span className="font-mono">{" {\"regionId\":\"...\"} "}</span>
            </p>
          </div>
          <form action={createPortalReportAction} className="grid gap-4">
            <select
              name="type"
              className="h-12 rounded-xl border border-border/50 bg-white px-4 text-sm text-foreground shadow-sm"
              defaultValue="MEETING_SUMMARY"
            >
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Textarea name="filters" placeholder='{"regionId":"..."}' />
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <input name="approvalRequired" type="checkbox" />
              {copy?.approvalRequired ?? "Approval required before run"}
            </label>
            <div>
              <Button type="submit">{copy?.createButton ?? "Create report"}</Button>
            </div>
          </form>
        </div>
      </GovernanceSection>

      {reports.length === 0 ? (
        <GovernanceSection
          title={copy?.noneTitle ?? "No reports yet"}
          description={copy?.noneDesc ?? "The backend returned no reports for this account."}
        >
          <GovernanceEmptyState
            title={copy?.emptyTitle ?? "No report jobs in scope"}
            description={copy?.emptyDesc ?? "Create the first report request to begin the workflow."}
          />
        </GovernanceSection>
      ) : (
        <GovernanceSection
          title={copy?.queueTitle ?? "Report queue"}
          description={copy?.queueDesc ?? "Each report card keeps metadata, filters, workflow state, and available actions in one place."}
        >
        <div className="grid gap-6">
          {reports.map((report) => (
            <GovernanceListCard
              key={report.id}
              title={report.type}
              subtitle={`Created on ${formatDateLabel(report.createdAt)}`}
              badges={
                <>
                  <Badge className={reportStatusTone(report.status)}>{report.status}</Badge>
                  {report.approvalRequired ? (
                    <Badge className="bg-accent text-accent-foreground">{copy?.approvalBadge ?? "Approval required"}</Badge>
                  ) : null}
                </>
              }
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <GovernanceMetaGrid
                    columns={4}
                    items={[
                      { label: copy?.created ?? "Created", value: formatDateLabel(report.createdAt) },
                      { label: copy?.updated ?? "Updated", value: formatDateLabel(report.updatedAt) },
                      { label: copy?.createdBy ?? "Created by", value: report.createdById },
                      { label: copy?.approvedBy ?? "Approved by", value: report.approvedById ?? (locale === "ar" ? "لم يتم الاعتماد بعد" : "Not approved yet") },
                    ]}
                  />
                </div>

                <GovernanceMetaGrid
                  columns={2}
                  items={[
                    {
                      label: copy?.filters ?? "Filters",
                      value: report.filters ? JSON.stringify(report.filters) : (copy?.none ?? "None"),
                    },
                    {
                      label: copy?.generatedFile ?? "Generated file",
                      value: report.filePath ?? (copy?.noFile ?? "No file generated yet"),
                    },
                  ]}
                />

                <div className="flex flex-wrap gap-3 border-t border-border/20 pt-6">
                  {report.approvalRequired && report.status === "DRAFT" ? (
                    <PortalConfirmAction
                      action={submitPortalReportAction}
                      description={copy?.submitDesc ?? "This sends the report request into approval before generation can begin."}
                      fields={{ reportId: report.id }}
                      title={copy?.submitForApproval ?? "Submit report for approval?"}
                      triggerLabel={copy?.submitButton ?? "Submit"}
                      triggerVariant="outline"
                    />
                  ) : null}

                  {report.status === "PENDING" ? (
                    <PortalConfirmAction
                      action={approvePortalReportAction}
                      description={copy?.approveDesc ?? "Approving the report unlocks generation for this queued request."}
                      fields={{ reportId: report.id }}
                      title={copy?.approveTitle ?? "Approve this report?"}
                      triggerLabel={copy?.approveButton ?? "Approve"}
                    />
                  ) : null}

                  {(!report.approvalRequired && report.status === "DRAFT") ||
                  report.status === "APPROVED" ? (
                    <PortalConfirmAction
                      action={runPortalReportAction}
                      confirmVariant="secondary"
                      description={copy?.runDesc ?? "Running the report begins generation using the saved scope and filter set."}
                      fields={{ reportId: report.id }}
                      title={copy?.runTitle ?? "Generate this report now?"}
                      triggerLabel={copy?.runButton ?? "Run report"}
                      triggerVariant="secondary"
                    />
                  ) : null}
                </div>
              </div>
            </GovernanceListCard>
          ))}
        </div>
        </GovernanceSection>
      )}
    </div>
  );
}
