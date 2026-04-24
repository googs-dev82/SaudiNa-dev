import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/config/site";
import { meetingsService } from "@/services/meetings.service";

export default async function MeetingDetailsPage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params;
  const meeting = await meetingsService.getById(id);

  if (!meeting) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <Link href={`/${locale}/meetings`} className="text-sm font-medium text-primary">
        {locale === "ar" ? "العودة للاجتماعات" : "Back to meetings"}
      </Link>

      <Card className="mt-6 bg-white">
        <CardContent className="space-y-6 p-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">{locale === "ar" ? meeting.nameAr : meeting.nameEn}</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{locale === "ar" ? meeting.descriptionAr : meeting.descriptionEn}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoBlock label={locale === "ar" ? "المدينة" : "City"} value={meeting.city} />
            <InfoBlock label={locale === "ar" ? "اليوم" : "Day"} value={meeting.dayOfWeek} />
            <InfoBlock label={locale === "ar" ? "الوقت" : "Time"} value={`${meeting.startTime}${meeting.endTime ? ` - ${meeting.endTime}` : ""}`} />
            <InfoBlock label={locale === "ar" ? "نوع الحضور" : "Attendance"} value={meeting.isOnline ? (locale === "ar" ? "افتراضي" : "Online") : locale === "ar" ? "حضوري" : "In person"} />
          </div>

          {meeting.isOnline && meeting.meetingLink ? (
            <a className="inline-flex rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground" href={meeting.meetingLink} rel="noreferrer" target="_blank">
              {locale === "ar" ? "فتح رابط الاجتماع" : "Open meeting link"}
            </a>
          ) : (
            <div className="rounded-2xl bg-muted p-6 text-sm text-muted-foreground">
              <p>{locale === "ar" ? meeting.addressAr : meeting.addressEn}</p>
              {meeting.latitude && meeting.longitude ? <p className="mt-2">{meeting.latitude}, {meeting.longitude}</p> : null}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-lg font-medium text-primary">{value}</p>
    </div>
  );
}
