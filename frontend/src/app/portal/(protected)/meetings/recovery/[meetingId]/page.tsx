import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import { RecoveryMeetingEditor } from "@/features/portal/components/recovery-meeting-editor";
import { PortalActionForm } from "@/features/portal/components/portal-action-form";
import {
  PortalApiError,
  PortalArea,
  PortalRecoveryMeeting,
  PortalRegion,
  getPortalAreas,
  getPortalRecoveryMeetings,
  getPortalRegions,
} from "@/features/portal/lib/api";
import {
  archiveRecoveryMeetingAction,
  publishRecoveryMeetingAction,
  unpublishRecoveryMeetingAction,
  updatePortalRecoveryMeetingFormAction,
} from "@/features/portal/lib/mutations";
import {
  getRecoveryMeetingArea,
  getRecoveryMeetingRegion,
} from "@/features/portal/lib/recovery-meetings";
import { getPortalLocale, requirePortalUser } from "@/features/portal/lib/session";

function formatDateTime(value: string, locale: "ar" | "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusTone(status: string) {
  if (status === "PUBLISHED") return "bg-emerald-100 text-emerald-800";
  if (status === "ARCHIVED") return "bg-slate-200 text-slate-700";
  return "bg-amber-100 text-amber-800";
}

function dayLabel(value: string, locale: "ar" | "en") {
  if (locale === "ar") {
    return (
      {
        Sunday: "الأحد",
        Monday: "الاثنين",
        Tuesday: "الثلاثاء",
        Wednesday: "الأربعاء",
        Thursday: "الخميس",
        Friday: "الجمعة",
        Saturday: "السبت",
      }[value] ?? value
    );
  }

  return value;
}

function languageLabel(value: string, locale: "ar" | "en") {
  if (locale === "ar") {
    return (
      {
        ARABIC: "العربية",
        ENGLISH: "الإنجليزية",
        BILINGUAL: "ثنائي اللغة",
      }[value] ?? value
    );
  }

  return value;
}

function genderLabel(value: string, locale: "ar" | "en") {
  if (locale === "ar") {
    return (
      {
        MALE: "رجال",
        FEMALE: "نساء",
        MIXED: "مختلط",
      }[value] ?? value
    );
  }

  return value;
}

function statusLabel(value: string, locale: "ar" | "en") {
  if (locale === "ar") {
    return (
      {
        PUBLISHED: "منشور",
        DRAFT: "مسودة",
        ARCHIVED: "مؤرشف",
      }[value] ?? value
    );
  }

  return value;
}

export default async function PortalRecoveryMeetingDetailPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const user = await requirePortalUser();
  const locale = await getPortalLocale(user);
  const { meetingId } = await params;

  let meetings: PortalRecoveryMeeting[] = [];
  let regions: PortalRegion[] = [];
  let areas: PortalArea[] = [];
  let errorMessage: string | null = null;

  try {
    [meetings, regions, areas] = await Promise.all([
      getPortalRecoveryMeetings(),
      getPortalRegions(),
      getPortalAreas(),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof PortalApiError
        ? error.message
        : "We could not load the recovery meeting details from the backend.";
  }

  if (errorMessage) {
    return (
      <Card className="bg-white">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-primary">
            Unable to load recovery meeting
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {errorMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  const meeting = meetings.find((item) => item.id === meetingId);

  if (!meeting) {
    notFound();
  }

  const area = getRecoveryMeetingArea(meeting, areas);
  const region = getRecoveryMeetingRegion(meeting, regions, areas);

  return (
    <div className="space-y-6" dir={locale}>
      <Card className="overflow-hidden border-none bg-gradient-to-br from-[#f7fbf8] via-white to-[#f1f6ff]">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Button variant="ghost" asChild>
                <Link href="/portal/meetings/recovery">{locale === "ar" ? "العودة إلى القائمة" : "Back to listing"}</Link>
              </Button>
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusTone(meeting.status)}>{statusLabel(meeting.status, locale)}</Badge>
                  <Badge className="bg-primary/10 text-primary">{languageLabel(meeting.language, locale)}</Badge>
                  <Badge>{genderLabel(meeting.gender, locale)}</Badge>
                </div>
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-primary">
                  {locale === "ar" ? meeting.nameAr : meeting.nameEn}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">{locale === "ar" ? meeting.nameEn : meeting.nameAr}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {meeting.status !== "PUBLISHED" ? (
                <PortalConfirmAction
                  action={publishRecoveryMeetingAction}
                  description={locale === "ar" ? "النشر يجعل هذا الاجتماع ظاهرًا عبر تجربة الاكتشاف العامة." : "Publishing makes this recovery meeting visible through the public discovery experience."}
                  fields={{ meetingId: meeting.id }}
                  title={locale === "ar" ? "نشر اجتماع التعافي؟" : "Publish recovery meeting?"}
                  triggerLabel={locale === "ar" ? "نشر" : "Publish"}
                />
              ) : (
                <PortalConfirmAction
                  action={unpublishRecoveryMeetingAction}
                  description={locale === "ar" ? "إلغاء النشر يزيل الاجتماع من الدليل العام حتى يُنشر مرة أخرى." : "Unpublishing removes this meeting from the public directory until it is published again."}
                  fields={{ meetingId: meeting.id }}
                  title={locale === "ar" ? "إلغاء نشر اجتماع التعافي؟" : "Unpublish recovery meeting?"}
                  triggerLabel={locale === "ar" ? "إلغاء النشر" : "Unpublish"}
                  triggerVariant="outline"
                />
              )}
              {meeting.status !== "ARCHIVED" ? (
                <PortalConfirmAction
                  action={archiveRecoveryMeetingAction}
                  confirmVariant="destructive"
                  description={locale === "ar" ? "الأرشفة تُخرج هذا السجل من الاستخدام التشغيلي النشط." : "Archiving retires this meeting record from active operational use."}
                  fields={{ meetingId: meeting.id }}
                  title={locale === "ar" ? "أرشفة اجتماع التعافي؟" : "Archive recovery meeting?"}
                  triggerLabel={locale === "ar" ? "أرشفة" : "Archive"}
                  triggerVariant="destructive"
                />
              ) : null}
            </div>
          </div>

          <p className="max-w-4xl text-base leading-8 text-muted-foreground">
            {meeting.descriptionEn ??
              meeting.descriptionAr ??
              (locale === "ar" ? "لم تتم إضافة وصف لهذا الاجتماع بعد." : "No description has been added for this meeting yet.")}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="bg-white">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-2xl font-bold text-primary">{locale === "ar" ? "نظرة عامة" : "Overview"}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-muted/10 p-4">
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "المنطقة الفرعية" : "Area"}</p>
                  <p className="mt-2 font-semibold text-primary">
                    {locale === "ar" ? area?.nameAr ?? "منطقة غير معروفة" : area?.nameEn ?? "Unknown area"}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/10 p-4">
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "المنطقة" : "Region"}</p>
                  <p className="mt-2 font-semibold text-primary">
                    {locale === "ar" ? region?.nameAr ?? "منطقة غير معروفة" : region?.nameEn ?? "Unknown region"}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/10 p-4">
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "المدينة" : "City"}</p>
                  <p className="mt-2 font-semibold text-primary">{meeting.city}</p>
                </div>
                <div className="rounded-2xl bg-muted/10 p-4">
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "الحي" : "District"}</p>
                  <p className="mt-2 font-semibold text-primary">
                    {meeting.district ?? (locale === "ar" ? "غير محدد" : "Not set")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-2xl font-bold text-primary">{locale === "ar" ? "الجدول" : "Schedule"}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-muted/10 p-4">
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "اليوم" : "Day"}</p>
                  <p className="mt-2 font-semibold text-primary">{dayLabel(meeting.dayOfWeek, locale)}</p>
                </div>
                <div className="rounded-2xl bg-muted/10 p-4">
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "الوقت" : "Time"}</p>
                  <p className="mt-2 font-semibold text-primary">
                    {meeting.startTime}
                    {meeting.endTime ? ` - ${meeting.endTime}` : ""}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/10 p-4">
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "اللغة" : "Language"}</p>
                  <p className="mt-2 font-semibold text-primary">{languageLabel(meeting.language, locale)}</p>
                </div>
                <div className="rounded-2xl bg-muted/10 p-4">
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "الجنس" : "Gender"}</p>
                  <p className="mt-2 font-semibold text-primary">{genderLabel(meeting.gender, locale)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-2xl font-bold text-primary">
                {meeting.isOnline ? (locale === "ar" ? "معلومات الاتصال" : "Online info") : (locale === "ar" ? "الموقع" : "Location")}
              </h2>
              {meeting.isOnline ? (
                <div className="rounded-2xl bg-muted/10 p-4">
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "رابط الاجتماع" : "Meeting link"}</p>
                  <p className="mt-2 break-all font-semibold text-primary">
                    {meeting.meetingLink ?? (locale === "ar" ? "لا يوجد رابط" : "No link provided")}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">{locale === "ar" ? "العنوان (EN)" : "Address (EN)"}</p>
                    <p className="mt-2 font-semibold text-primary">
                      {meeting.addressEn ?? "Not set"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">{locale === "ar" ? "العنوان (AR)" : "Address (AR)"}</p>
                    <p className="mt-2 font-semibold text-primary">
                      {meeting.addressAr ?? "Not set"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">{locale === "ar" ? "خط العرض" : "Latitude"}</p>
                    <p className="mt-2 font-semibold text-primary">
                      {meeting.latitude ?? (locale === "ar" ? "غير محدد" : "Not set")}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">{locale === "ar" ? "خط الطول" : "Longitude"}</p>
                    <p className="mt-2 font-semibold text-primary">
                      {meeting.longitude ?? (locale === "ar" ? "غير محدد" : "Not set")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card id="edit" className="bg-white">
            <CardContent className="p-6">
              <RecoveryMeetingEditor
                action={updatePortalRecoveryMeetingFormAction}
                meeting={meeting}
                regions={regions}
                areas={areas}
                locale={locale}
                title={locale === "ar" ? "تعديل الاجتماع" : "Edit meeting"}
                description={locale === "ar" ? "حدّث البيانات العامة بحذر. هذه النماذج منظمة لتقليل الأخطاء وتجميع الحقول ذات الصلة." : "Update public-facing data carefully. This form is structured to reduce mistakes and keep related fields grouped."}
                submitLabel={locale === "ar" ? "حفظ التغييرات" : "Save changes"}
                successMessage={locale === "ar" ? "تم تحديث اجتماع التعافي بنجاح." : "Recovery meeting updated successfully."}
                compact
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white xl:sticky xl:top-6">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-xl font-bold text-primary">{locale === "ar" ? "البيانات الوصفية" : "Metadata"}</h2>
              <div className="grid gap-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span>{locale === "ar" ? "أنشئ بواسطة" : "Created by"}</span>
                  <span className="max-w-[180px] truncate font-medium text-foreground">
                    {meeting.createdById}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{locale === "ar" ? "تم الإنشاء" : "Created at"}</span>
                  <span className="font-medium text-foreground">
                    {formatDateTime(meeting.createdAt, locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{locale === "ar" ? "آخر تحديث" : "Last updated"}</span>
                  <span className="font-medium text-foreground">
                    {formatDateTime(meeting.updatedAt, locale)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-xl font-bold text-primary">{locale === "ar" ? "الخط الزمني للحالة" : "Status timeline"}</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium text-foreground">{locale === "ar" ? "تم الإنشاء" : "Created"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(meeting.createdAt, locale)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-accent" />
                  <div>
                    <p className="font-medium text-foreground">{locale === "ar" ? "آخر تحديث" : "Last updated"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(meeting.updatedAt, locale)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
                  <div>
                    <p className="font-medium text-foreground">{locale === "ar" ? "الحالة الحالية" : "Current status"}</p>
                    <p className="text-sm text-muted-foreground">{statusLabel(meeting.status, locale)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
