import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  PortalApiError,
  PortalContactSubmission,
  getPortalContactSubmissions,
} from "@/features/portal/lib/api";
import {
  GovernanceEmptyState,
  GovernanceListCard,
  GovernanceMetaGrid,
  GovernanceMetricCard,
  GovernanceMetricGrid,
  GovernancePageHeader,
  GovernanceSection,
} from "@/features/portal/components/governance-ui";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { updatePortalContactSubmissionAction } from "@/features/portal/lib/mutations";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

const contactStatuses = ["NEW", "IN_PROGRESS", "RESOLVED"] as const;

export default async function PortalContactPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription: "حسابك لا يملك حاليًا صلاحية الوصول إلى رسائل التواصل.",
          restrictedEmptyTitle: "إدارة رسائل التواصل غير متاحة",
          restrictedEmptyDesc: "يمكن فقط للمشرف العام وأعضاء لجنة العلاقات العامة المعتمدين العمل على هذه الرسائل.",
          loadTitle: "تعذّر تحميل رسائل التواصل",
          loadEmptyTitle: "طابور التواصل غير متاح",
          loadEmptyDesc: "لم تُرجع الواجهة الخلفية رسائل التواصل لهذا الحساب.",
          eyebrow: "الإشراف",
          title: "رسائل التواصل",
          description:
            "راجع الرسائل الواردة من الدعم أو الاستفسارات، ونظمها، وتعامل معها داخل طابور تشغيلي مضبوط.",
          messages: "الرسائل",
          new: "جديدة",
          inProgress: "قيد المعالجة",
          resolved: "تم الحل",
          noneTitle: "لا توجد رسائل تواصل",
          noneDesc: "لا توجد أي رسائل تواصل في الواجهة الخلفية الآن.",
          clearTitle: "طابور التواصل فارغ",
          clearDesc: "لا توجد رسائل دعم أو استفسارات تنتظر الإجراء الآن.",
          queueTitle: "طابور التواصل",
          queueDesc: "كل سجل يحتفظ بملاحظات المشغل وحالة الدورة الحالية والتوجيه إلى اللجنة في مكان واحد.",
          received: "تاريخ الاستلام",
          updated: "آخر تحديث",
          committee: "اللجنة المعينة",
          internalNotes: "ملاحظات داخلية",
          save: "حفظ الرسالة",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDescription: "Your account does not currently have access to contact submissions.",
          restrictedEmptyTitle: "Contact governance is unavailable",
          restrictedEmptyDesc: "Only Super Admins and authorized PR Committee members can work with contact submissions.",
          loadTitle: "Unable to load contact submissions",
          loadEmptyTitle: "The contact queue is unavailable",
          loadEmptyDesc: "The backend did not return contact submissions for the current account.",
          eyebrow: "Oversight",
          title: "Contact submissions",
          description: "Review, triage, and resolve inbound support or enquiry messages inside a governed operational queue.",
          messages: "Messages",
          new: "New",
          inProgress: "In progress",
          resolved: "Resolved",
          noneTitle: "No contact submissions",
          noneDesc: "There are no contact submissions in the backend right now.",
          clearTitle: "The contact queue is clear",
          clearDesc: "No support or enquiry messages are currently waiting for action.",
          queueTitle: "Contact queue",
          queueDesc: "Each record keeps operator notes, current lifecycle state, and committee routing in one place.",
          received: "Received",
          updated: "Last updated",
          committee: "Assigned committee",
          internalNotes: "Internal notes",
          save: "Save submission",
        };

  if (!canAccessPortalHref(user, "/portal/contact")) {
    return (
      <GovernanceSection
        title={copy.restrictedTitle}
        description={copy.restrictedDescription}
      >
        <GovernanceEmptyState
          title={copy.restrictedEmptyTitle}
          description={copy.restrictedEmptyDesc}
        />
      </GovernanceSection>
    );
  }

  let submissions: PortalContactSubmission[] = [];
  let errorMessage: string | null = null;

  try {
    submissions = await getPortalContactSubmissions();
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load contact submissions from the backend.";
  }

  if (errorMessage) {
    return (
      <GovernanceSection title={copy.loadTitle} description={errorMessage}>
        <GovernanceEmptyState
          title={copy.loadEmptyTitle}
          description={copy.loadEmptyDesc}
        />
      </GovernanceSection>
    );
  }

  const freshCount = submissions.filter((submission) => submission.status === "NEW").length;
  const activeCount = submissions.filter(
    (submission) => submission.status === "IN_PROGRESS",
  ).length;
  const resolvedCount = submissions.filter(
    (submission) => submission.status === "RESOLVED",
  ).length;

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy.eyebrow, copy.title]}
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard label={copy.messages} value={submissions.length} hint={locale === "ar" ? "رسائل التواصل الظاهرة ضمن النطاق." : "Visible contact submissions in scope."} />
        <GovernanceMetricCard label={copy.new} value={freshCount} hint={locale === "ar" ? "استفسارات جديدة بانتظار أول إجراء." : "New enquiries awaiting first action."} />
        <GovernanceMetricCard label={copy.inProgress} value={activeCount} hint={locale === "ar" ? "رسائل تم إسنادها أو تتم معالجتها الآن." : "Messages currently assigned or being handled."} />
        <GovernanceMetricCard label={copy.resolved} value={resolvedCount} hint={locale === "ar" ? "رسائل أُغلقت بالفعل من فريق العمليات." : "Messages already closed by the operations team."} />
      </GovernanceMetricGrid>

      {submissions.length === 0 ? (
        <GovernanceSection
          title={copy.noneTitle}
          description={copy.noneDesc}
        >
          <GovernanceEmptyState
            title={copy.clearTitle}
            description={copy.clearDesc}
          />
        </GovernanceSection>
      ) : (
        <GovernanceSection
          title={copy.queueTitle}
          description={copy.queueDesc}
        >
        <div className="grid gap-6">
          {submissions.map((submission) => (
            <GovernanceListCard
              key={submission.id}
              title={submission.subject}
              subtitle={`${submission.name} · ${submission.email}`}
              badges={
                <>
                  <Badge>{submission.status}</Badge>
                  <Badge className="bg-accent text-accent-foreground">
                    {submission.assignedCommitteeCode}
                  </Badge>
                </>
              }
            >
              <div className="space-y-6">
                <GovernanceMetaGrid
                  columns={3}
                  items={[
                    { label: copy.received, value: submission.createdAt.slice(0, 10) },
                    { label: copy.updated, value: submission.updatedAt.slice(0, 10) },
                    { label: copy.committee, value: submission.assignedCommitteeCode },
                  ]}
                />

                <p className="text-sm leading-7 text-muted-foreground">
                  {submission.message}
                </p>

                {submission.internalNotes ? (
                  <div className="rounded-[1.35rem] bg-white/88 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/80">
                      {copy.internalNotes}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {submission.internalNotes}
                    </p>
                  </div>
                ) : null}

                <form
                  action={updatePortalContactSubmissionAction}
                  className="grid gap-4 rounded-[1.5rem] bg-white/92 p-5"
                >
                  <input
                    name="submissionId"
                    type="hidden"
                    value={submission.id}
                  />
                  <select
                    className="h-12 rounded-xl border border-border/50 bg-white px-4 text-sm text-foreground shadow-sm"
                    defaultValue={submission.status}
                    name="status"
                  >
                    {contactStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    defaultValue={submission.internalNotes ?? ""}
                    name="internalNotes"
                    placeholder="Internal notes"
                  />
                  <div>
                    <Button type="submit">{copy.save}</Button>
                  </div>
                </form>
                </div>
            </GovernanceListCard>
          ))}
        </div>
        </GovernanceSection>
      )}
    </div>
  );
}
