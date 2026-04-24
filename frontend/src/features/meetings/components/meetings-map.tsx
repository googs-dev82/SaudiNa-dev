"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";
import Link from "next/link";

import { getMeetingTitle } from "@/features/meetings/lib/meeting-filters";
import type { Locale, MeetingDto } from "@/types/api";

const markerIcon = divIcon({
  className: "",
  html: '<span style="display:flex;height:18px;width:18px;align-items:center;justify-content:center;border-radius:9999px;background:#2D4B5F;border:3px solid white;box-shadow:0 8px 20px rgba(45,75,95,.22)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function MeetingsMap({ locale, meetings }: { locale: Locale; meetings: MeetingDto[] }) {
  const mappableMeetings = meetings.filter(
    (meeting) =>
      !meeting.isOnline &&
      typeof meeting.latitude === "number" &&
      typeof meeting.longitude === "number",
  );

  if (mappableMeetings.length === 0) {
    return (
      <div className="flex min-h-[28rem] items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card text-center text-sm text-muted-foreground editorial-shadow">
        <p>{locale === "ar" ? "لا توجد مواقع متاحة على الخريطة لهذه الفلاتر." : "No mappable meeting locations are available for the current filters."}</p>
      </div>
    );
  }

  const center = [mappableMeetings[0].latitude as number, mappableMeetings[0].longitude as number] as [number, number];

  return (
    <div className="overflow-hidden rounded-3xl border border-border/40 bg-card editorial-shadow">
      <MapContainer center={center} zoom={6} scrollWheelZoom className="h-[32rem] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mappableMeetings.map((meeting) => (
          <Marker
            key={meeting.id}
            icon={markerIcon}
            position={[meeting.latitude as number, meeting.longitude as number]}
          >
            <Popup>
              <div className="space-y-2 text-sm">
                <p className="font-bold text-primary">{getMeetingTitle(meeting, locale)}</p>
                <p>{meeting.city}{meeting.district ? ` • ${meeting.district}` : ""}</p>
                <p>{meeting.dayOfWeek} • {meeting.startTime}</p>
                <Link className="font-semibold text-primary" href={`/${locale}/meetings/${meeting.id}`}>
                  {locale === "ar" ? "عرض التفاصيل" : "View details"}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
