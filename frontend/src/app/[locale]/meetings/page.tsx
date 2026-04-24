import type { Locale } from "@/config/site";
import { MeetingsExplorer } from "@/features/meetings/components/meetings-explorer";
import { locationsService } from "@/services/locations.service";
import { meetingsService } from "@/services/meetings.service";

export default async function MeetingsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  const filters = await searchParams;
  const query = typeof filters.query === "string" ? filters.query : undefined;
  const city = typeof filters.city === "string" ? filters.city : undefined;
  const dayOfWeek = typeof filters.dayOfWeek === "string" ? filters.dayOfWeek : undefined;
  const language = typeof filters.language === "string" ? filters.language : undefined;
  const areaId = typeof filters.areaId === "string" ? filters.areaId : undefined;
  const mode = typeof filters.mode === "string" ? filters.mode : undefined;
  const gender = typeof filters.gender === "string" ? filters.gender : undefined;
  const response = await meetingsService.list({
    query,
    city,
    dayOfWeek,
    language,
    areaId,
    gender,
    isOnline: mode === "online" ? "true" : mode === "in-person" ? "false" : undefined,
    limit: 20,
  });
  const areas = await locationsService.listAreas();

  return <MeetingsExplorer locale={locale} meetings={response.items} areas={areas} initialFilters={{ query, city, dayOfWeek, language, areaId, gender, mode, view: typeof filters.view === "string" ? filters.view : undefined }} />;
}
