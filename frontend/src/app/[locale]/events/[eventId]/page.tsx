import { notFound } from "next/navigation";
import type { Locale } from "@/config/site";
import { EventDetail } from "@/features/events/components/event-detail";
import { eventsService } from "@/services/events.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ locale: Locale; eventId: string }>;
}) {
  const { locale, eventId } = await params;
  const event = await eventsService.getById(eventId);

  if (!event) {
    notFound();
  }

  return <EventDetail locale={locale} event={event} />;
}
