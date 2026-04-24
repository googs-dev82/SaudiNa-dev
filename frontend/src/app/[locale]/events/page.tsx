import type { Locale } from "@/config/site";
import { EventDirectory } from "@/features/events/components/event-directory";
import { eventsService } from "@/services/events.service";
import type { EventMode } from "@/types/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const filters = await searchParams;

  const query = typeof filters.query === "string" ? filters.query : undefined;
  const mode = typeof filters.mode === "string" ? filters.mode : undefined;
  const regionId = typeof filters.regionId === "string" ? filters.regionId : undefined;
  const areaId = typeof filters.areaId === "string" ? filters.areaId : undefined;
  const dateFrom = typeof filters.dateFrom === "string" ? filters.dateFrom : undefined;
  const dateTo = typeof filters.dateTo === "string" ? filters.dateTo : undefined;

  const response = await eventsService.list({
    query,
    mode: mode && ["PHYSICAL", "ONLINE", "HYBRID"].includes(mode) ? (mode as EventMode) : undefined,
    regionId,
    areaId,
    dateFrom,
    dateTo,
  });

  return (
    <EventDirectory
      locale={locale}
      events={response}
      title={locale === "ar" ? "الفعاليات" : "Events"}
      description={locale === "ar"
        ? "استعرض الفعاليات العامة المنشورة فقط. تظل الفعاليات الخاصة محمية وغير مرئية للعامة."
        : "Browse only published public events. Private events remain protected and hidden from the public."}
    />
  );
}
