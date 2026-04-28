import type { Locale } from "@/config/site";
import { MeetingsExplorer } from "@/features/meetings/components/meetings-explorer";
import { locationsService } from "@/services/locations.service";
import { meetingsService } from "@/services/meetings.service";

function getTodayInRiyadh() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    weekday: "long",
  }).format(new Date());
}

export default async function MeetingsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const filters = await searchParams;
  const defaultDayOfWeek = getTodayInRiyadh();
  const query = typeof filters.query === "string" ? filters.query : undefined;
  const city = typeof filters.city === "string" ? filters.city : undefined;
  const selectedDayOfWeek = typeof filters.dayOfWeek === "string" ? filters.dayOfWeek : defaultDayOfWeek;
  const dayOfWeek = selectedDayOfWeek === "all" ? undefined : selectedDayOfWeek;
  const language = typeof filters.language === "string" ? filters.language : undefined;
  const areaId = typeof filters.areaId === "string" ? filters.areaId : undefined;
  const mode = typeof filters.mode === "string" ? filters.mode : undefined;
  const gender = typeof filters.gender === "string" ? filters.gender : undefined;
  const [response, weeklyResponse, areas] = await Promise.all([
    meetingsService.list({
      query,
      city,
      dayOfWeek,
      language,
      areaId,
      gender,
      isOnline: mode === "online" ? "true" : mode === "in-person" ? "false" : undefined,
      limit: 20,
    }),
    meetingsService.list({ limit: 100 }),
    locationsService.listAreas(),
  ]);

  return <MeetingsExplorer locale={locale} meetings={response.items} weeklyMeetings={weeklyResponse.items} areas={areas} defaultDayOfWeek={defaultDayOfWeek} initialFilters={{ query, city, dayOfWeek: selectedDayOfWeek, language, areaId, gender, mode, view: typeof filters.view === "string" ? filters.view : undefined }} />;
}
