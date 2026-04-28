import Link from "next/link";
import { MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { InServiceMeetingForm } from "@/features/portal/components/in-service-meeting-form";
import {
  PortalCommittee,
  PortalInServiceMeeting,
  PortalApiError,
  getPortalCommittees,
  getPortalInServiceMeetings,
} from "@/features/portal/lib/api";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import {
  approvePortalInServiceMeetingAction,
  rejectPortalInServiceMeetingAction,
  submitPortalInServiceMeetingAction,
  updatePortalInServiceMeetingAction,
} from "@/features/portal/lib/mutations";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-SA", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function statusTone(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800";
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    case "REJECTED":
      return "bg-rose-100 text-rose-800";
    case "ARCHIVED":
      return "bg-secondary/10 text-primary";
    default:
      return "bg-sky-100 text-sky-800";
  }
}

function getCommitteeName(committees: PortalCommittee[], committeeId: string) {
  return committees.find((committee) => committee.id === committeeId)?.nameEn ?? committeeId;
}

function renderActivitySummary(activities: PortalInServiceMeeting["plannedActivities"]) {
  if (!activities.length) {
    return "No planned activities";
  }

  return (
    <div className="flex flex-col gap-2">
      {activities.map((activity, index) => (
        <div key={`${String(activity.description ?? "activity")}-${index}`} className="rounded-lg border border-secondary/10 bg-white/90 px-3 py-2 text-sm">
          <p className="font-medium text-primary">
            {String(activity.description ?? `Activity ${index + 1}`)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Assignee: {String(activity.assignee ?? "Not set")} · Due: {String(activity.dueDate ?? "Not set")} · Status: {String(activity.status ?? "Pending")}
          </p>
        </div>
      ))}
    </div>
  );
}

export default async function PortalInServiceMeetingsPage() {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const copy =
    locale === "ar"
      ? {
          restrictedTitle: "الوصول مقيد",
          restrictedDescription: "الأدوار والتعيينات الحالية لا تمنحك صلاحية الوصول إلى اجتماعات الخدمة.",
          restrictedEmptyTitle: "الوصول إلى سير العمل غير متاح",
          restrictedEmptyDesc: "أمناء اللجان ومديرو اللجان والمشرف العام فقط يمكنهم الوصول إلى هذه الوحدة.",
          loadTitle: "تعذّر تحميل اجتماعات الخدمة",
          loadEmptyTitle: "سجل سير العمل غير متاح",
          loadEmptyDesc: "لم تُرجع الواجهة الخلفية سجلات اجتماعات الخدمة لهذا الحساب.",
          eyebrow: "العمليات",
          title: "اجتماعات الخدمة",
          description:
            "يمكن لأمناء اللجان والمديرين إنشاء ومراجعة واعتماد اجتماعات اللجان الداخلية في مساحة واحدة خاضعة للحوكمة.",
          workflows: "سير العمل",
          drafts: "مسودات",
          pending: "قيد الانتظار",
          approved: "معتمدة",
          noMeetingsTitle: "لا توجد اجتماعات خدمة ضمن النطاق",
          noMeetingsDesc: "لم يُرجع الخادم أي سير عمل لاجتماعات اللجان لهذا الحساب الآن.",
          noWorkflows: "لا توجد مهام لجنة بعد",
          noWorkflowsDesc: "أنشئ أول سجل اجتماع أو انتظر وصول سير عمل ضمن نطاق التعيين.",
          registerTitle: "سجل سير العمل",
          registerDesc: "كل بطاقة تجمع محتوى الاجتماع والأنشطة المخططة وحالة الاعتماد والإجراءات التالية.",
          createPhysical: "اجتماع حضوري",
          createZoom: "اجتماع Zoom",
          format: "النوع",
          physical: "حضوري",
          zoom: "Zoom",
          venue: "المكان",
          location: "الموقع",
          zoomAccess: "بيانات Zoom",
          committee: "اللجنة",
          start: "البداية",
          end: "النهاية",
          updated: "آخر تحديث",
          minutes: "محضر الاجتماع",
          activities: "الأنشطة المخططة",
          notes: "ملاحظات",
          rejectionComments: "تعليقات الرفض",
          nextActions: "الإجراءات التالية",
        }
      : {
          restrictedTitle: "Access restricted",
          restrictedDescription: "Your active roles and assignments do not currently allow access to in-service meetings administration.",
          restrictedEmptyTitle: "Committee workflow access is unavailable",
          restrictedEmptyDesc: "Committee Secretaries, Committee Managers, and Super Admins are the only roles that can access this module.",
          loadTitle: "Unable to load in-service meetings",
          loadEmptyTitle: "The committee workflow register is unavailable",
          loadEmptyDesc: "The backend did not return in-service meeting workflows for this account.",
          eyebrow: "Operations",
          title: "In-service meetings",
          description:
            "Committee Secretaries and Managers can create, submit, review, and approve internal committee meetings inside one governed workspace.",
          workflows: "Workflows",
          drafts: "Drafts",
          pending: "Pending",
          approved: "Approved",
          noMeetingsTitle: "No in-service meetings in scope",
          noMeetingsDesc: "The backend returned no committee meeting workflows for this account right now.",
          noWorkflows: "No committee workflows yet",
          noWorkflowsDesc: "Create the first meeting record or wait for a committee-scoped workflow to enter your assignment scope.",
          registerTitle: "Workflow register",
          registerDesc: "Each card brings together meeting content, planned activities, approval state, and the next available actions.",
          createPhysical: "Physical meeting",
          createZoom: "Zoom meeting",
          format: "Format",
          physical: "Physical",
          zoom: "Zoom",
          venue: "Venue",
          location: "Location",
          zoomAccess: "Zoom access",
          committee: "Committee",
          start: "Start",
          end: "End",
          updated: "Updated",
          minutes: "Minutes of meeting",
          activities: "Planned activities",
          notes: "Notes",
          rejectionComments: "Rejection comments",
          nextActions: "Next actions",
        };

  if (!canAccessPortalHref(user, "/portal/meetings/in-service")) {
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

  let meetings: PortalInServiceMeeting[] = [];
  let committees: PortalCommittee[] = [];
  let errorMessage: string | null = null;

  try {
    [meetings, committees] = await Promise.all([
      getPortalInServiceMeetings(),
      getPortalCommittees(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load in-service meetings from the backend.";
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

  const drafts = meetings.filter((meeting) => meeting.status === "DRAFT").length;
  const pending = meetings.filter((meeting) => meeting.status === "PENDING").length;
  const approved = meetings.filter((meeting) => meeting.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      <GovernancePageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        breadcrumb={[locale === "ar" ? "البوابة" : "Portal", copy.eyebrow, copy.title]}
        primaryAction={
          <>
            <Button asChild className="shadow-sm">
              <Link href="/portal/meetings/in-service/physical">
                <MapPin data-icon="inline-start" />
                {copy.createPhysical}
              </Link>
            </Button>
            <Button asChild className="shadow-sm" variant="secondary">
              <Link href="/portal/meetings/in-service/zoom">
                <Video data-icon="inline-start" />
                {copy.createZoom}
              </Link>
            </Button>
          </>
        }
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard label={copy.workflows} value={meetings.length} hint={locale === "ar" ? "سجلات اجتماعات الخدمة الحالية ضمن النطاق." : "In-service meeting records currently in scope."} />
        <GovernanceMetricCard label={copy.drafts} value={drafts} hint={locale === "ar" ? "الاجتماعات ما زالت قيد إعداد أمين اللجنة." : "Meetings still being prepared by the committee secretary."} />
        <GovernanceMetricCard label={copy.pending} value={pending} hint={locale === "ar" ? "عناصر بانتظار الاعتماد أو الرفض." : "Items awaiting approval or rejection."} />
        <GovernanceMetricCard label={copy.approved} value={approved} hint={locale === "ar" ? "اجتماعات أنهت سير عمل الاعتماد المزدوج." : "Meetings that completed the maker-checker workflow."} />
      </GovernanceMetricGrid>


      {meetings.length === 0 ? (
        <GovernanceSection
          title={copy.noMeetingsTitle}
          description={copy.noMeetingsDesc}
        >
          <GovernanceEmptyState
            title={copy.noWorkflows}
            description={copy.noWorkflowsDesc}
          />
        </GovernanceSection>
      ) : (
        <GovernanceSection
          title={copy.registerTitle}
          description={copy.registerDesc}
        >
        <div className="grid gap-6">
          {meetings.map((meeting) => (
            <GovernanceListCard
              key={meeting.id}
              title={meeting.titleEn || meeting.titleAr || "In-service meeting"}
              subtitle={`${meeting.titleAr} · ${getCommitteeName(committees, meeting.committeeId)}`}
              badges={
                <>
                  <Badge className={statusTone(meeting.status)}>{meeting.status}</Badge>
                  <Badge variant="outline">
                    {meeting.meetingFormat === "ZOOM" ? copy.zoom : copy.physical}
                  </Badge>
                  <Badge className="bg-accent text-accent-foreground">
                    {formatDateLabel(meeting.meetingDate)}
                  </Badge>
                </>
              }
            >
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
              <GovernanceMetaGrid
                    columns={4}
                    items={[
                      { label: copy.committee, value: getCommitteeName(committees, meeting.committeeId) },
                      { label: copy.format, value: meeting.meetingFormat === "ZOOM" ? copy.zoom : copy.physical },
                      { label: copy.start, value: meeting.startTime },
                      { label: copy.end, value: meeting.endTime ?? (locale === "ar" ? "غير محدد" : "Not set") },
                    ]}
                  />
                </div>

                {meeting.description ? (
                  <p className="text-sm leading-7 text-muted-foreground">{meeting.description}</p>
                ) : null}

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-lg border border-secondary/10 bg-white/88 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/80">
                      {meeting.meetingFormat === "ZOOM" ? copy.zoomAccess : copy.location}
                    </p>
                    {meeting.meetingFormat === "ZOOM" ? (
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                        <p>{meeting.zoomJoinUrl}</p>
                        <p>{copy.zoom}: {meeting.zoomMeetingId ?? (locale === "ar" ? "غير محدد" : "Not set")}</p>
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                        <p className="font-medium text-primary">{meeting.venueName}</p>
                        <p>{[meeting.city, meeting.district].filter(Boolean).join(" · ")}</p>
                        <p>{meeting.address}</p>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-secondary/10 bg-white/88 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/80">
                      {copy.minutes}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{meeting.mom}</p>
                  </div>
                  <div className="rounded-lg border border-secondary/10 bg-white/88 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/80">
                      {copy.activities}
                    </p>
                    <div className="mt-3">{renderActivitySummary(meeting.plannedActivities)}</div>
                  </div>
                </div>

                {meeting.notes || meeting.rejectionComments ? (
                  <GovernanceMetaGrid
                    columns={2}
                    items={[
                      { label: copy.notes, value: meeting.notes ?? (locale === "ar" ? "لا توجد ملاحظات" : "No notes") },
                      {
                        label: copy.rejectionComments,
                        value: meeting.rejectionComments ?? (locale === "ar" ? "لا توجد تعليقات رفض" : "No rejection comments"),
                      },
                    ]}
                  />
                ) : null}

                {meeting.status === "DRAFT" ? (
                  <div className="rounded-lg border border-secondary/10 bg-white/92 p-5">
                    <InServiceMeetingForm
                      action={updatePortalInServiceMeetingAction}
                      committees={committees}
                      format={meeting.meetingFormat}
                      meeting={meeting}
                      submitLabel={locale === "ar" ? "حفظ المسودة" : "Save draft"}
                    />
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3 border-t border-secondary/10 pt-6">
                  {meeting.status === "DRAFT" ? (
                    <PortalConfirmAction
                      action={submitPortalInServiceMeetingAction}
                      description="This sends the meeting into the approval workflow for committee management review."
                      fields={{ meetingId: meeting.id }}
                      title="Submit this meeting for approval?"
                      triggerLabel="Submit for approval"
                    />
                  ) : null}

                  {meeting.status === "PENDING" ? (
                    <>
                      <PortalConfirmAction
                        action={approvePortalInServiceMeetingAction}
                        description="Approval completes the maker-checker step and records the meeting as approved."
                        fields={{ meetingId: meeting.id }}
                        title="Approve this in-service meeting?"
                        triggerLabel="Approve"
                      />
                      <PortalConfirmAction
                        action={rejectPortalInServiceMeetingAction}
                        confirmVariant="destructive"
                        description="Rejection requires comments so the secretary knows what to fix before resubmission."
                        fields={{ meetingId: meeting.id }}
                        title="Reject this in-service meeting?"
                        triggerLabel="Reject"
                        triggerVariant="destructive"
                      >
                        <Input
                          minLength={10}
                          name="comments"
                          placeholder="Rejection comments"
                          required
                        />
                      </PortalConfirmAction>
                    </>
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
