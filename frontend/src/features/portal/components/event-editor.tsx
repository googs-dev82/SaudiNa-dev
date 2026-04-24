"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PortalActionForm } from "@/features/portal/components/portal-action-form";
import type { PortalActionState } from "@/features/portal/lib/action-state";
import type { PortalArea, PortalEvent, PortalRegion } from "@/features/portal/lib/api";
import type { Locale } from "@/config/site";

const eventModes = ["PHYSICAL", "ONLINE", "HYBRID"] as const;
const eventVisibilities = ["PUBLIC", "PRIVATE"] as const;

export function EventEditor({
  action,
  regions,
  areas,
  event,
  title,
  description,
  submitLabel,
  successMessage,
  onCancel,
  locale = "en",
}: {
  action: (previousState: PortalActionState, formData: FormData) => Promise<PortalActionState>;
  regions: PortalRegion[];
  areas: PortalArea[];
  event?: PortalEvent;
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  onCancel?: () => void;
  locale?: Locale;
}) {
  const [mode, setMode] = useState<"PHYSICAL" | "ONLINE" | "HYBRID">(
    (event?.mode as "PHYSICAL" | "ONLINE" | "HYBRID" | undefined) ?? "PHYSICAL",
  );
  const [selectedRegionId, setSelectedRegionId] = useState(event?.regionId ?? "");
  const copy =
    locale === "ar"
      ? {
          selectRegion: "اختر المنطقة",
          selectArea: "اختر المنطقة الفرعية",
          title: "عنوان الفعالية",
          duration: "المدة (بالدقائق)",
          description: "الوصف",
          visibility: "الرؤية",
          mode: "النمط",
          zoomEnabled: "فعّال لـ Zoom",
          invitationInstructions: "تعليمات الدعوة",
          locationAddress: "عنوان الموقع",
          latitude: "خط العرض",
          longitude: "خط الطول",
          meetingLink: "رابط الاجتماع",
          physical: "حضوري",
          online: "عبر الإنترنت",
          hybrid: "هجين",
          public: "عام",
          private: "خاص",
          cancel: "إلغاء",
        }
      : {
          selectRegion: "Select region",
          selectArea: "Select area",
          title: "Event title",
          duration: "Duration (minutes)",
          description: "Description",
          visibility: "Visibility",
          mode: "Mode",
          zoomEnabled: "Zoom-enabled",
          invitationInstructions: "Invitation instructions",
          locationAddress: "Location address",
          latitude: "Latitude",
          longitude: "Longitude",
          meetingLink: "Meeting link",
          physical: "Physical",
          online: "Online",
          hybrid: "Hybrid",
          public: "Public",
          private: "Private",
          cancel: "Cancel",
        };

  const filteredAreas = useMemo(() => {
    if (!selectedRegionId) {
      return areas;
    }
    return areas.filter((area) => area.regionId === selectedRegionId);
  }, [areas, selectedRegionId]);

  return (
    <PortalActionForm action={action} className="space-y-4" successMessage={successMessage}>
      {event ? <input type="hidden" name="eventId" value={event.id} /> : null}

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-primary">{title}</h3>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
      </div>

      <Card className="rounded-2xl border-border/40 bg-muted/10">
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <select
              name="regionId"
              defaultValue={event?.regionId ?? ""}
              className="h-12 rounded-xl border border-border/40 bg-white px-4"
              onChange={(e) => setSelectedRegionId(e.target.value)}
            >
              <option value="" disabled>{copy.selectRegion}</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{locale === "ar" ? region.nameAr : region.nameEn}</option>
              ))}
            </select>
            <select name="areaId" defaultValue={event?.areaId ?? ""} className="h-12 rounded-xl border border-border/40 bg-white px-4">
              <option value="" disabled>{copy.selectArea}</option>
              {(filteredAreas.length ? filteredAreas : areas).map((area) => (
                <option key={area.id} value={area.id}>{locale === "ar" ? area.nameAr : area.nameEn}</option>
              ))}
            </select>
            <Input name="title" placeholder={copy.title} defaultValue={event?.title ?? ""} required />
            <Input name="date" type="date" defaultValue={event?.date?.slice(0, 10) ?? ""} required />
            <Input name="startTime" type="time" defaultValue={event?.startTime ?? ""} required />
            <Input name="endTime" type="time" defaultValue={event?.endTime ?? ""} />
            <Input name="durationMinutes" type="number" min={1} max={720} defaultValue={event?.durationMinutes ?? ""} placeholder={copy.duration} />
            <Input name="timezone" defaultValue={event?.timezone ?? "Asia/Riyadh"} />
          </div>

          <Textarea name="description" placeholder={copy.description} defaultValue={event?.description ?? ""} />

          <div className="grid gap-4 md:grid-cols-3">
            <select name="visibility" defaultValue={event?.visibility ?? "PUBLIC"} className="h-12 rounded-xl border border-border/40 bg-white px-4">
              {eventVisibilities.map((value) => (
                <option key={value} value={value}>
                  {value === "PUBLIC" ? copy.public : copy.private}
                </option>
              ))}
            </select>
            <select
              name="mode"
              defaultValue={event?.mode ?? "PHYSICAL"}
              className="h-12 rounded-xl border border-border/40 bg-white px-4"
              onChange={(event) => setMode(event.target.value as "PHYSICAL" | "ONLINE" | "HYBRID")}
            >
              {eventModes.map((value) => (
                <option key={value} value={value}>
                  {value === "PHYSICAL" ? copy.physical : value === "ONLINE" ? copy.online : copy.hybrid}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-3 rounded-xl border border-border/40 bg-white px-4 py-3 text-sm">
              <input name="zoomEnabled" type="checkbox" defaultChecked={event?.zoomEnabled ?? false} />
              {copy.zoomEnabled}
            </label>
          </div>

          <Textarea name="invitationInstructions" placeholder={copy.invitationInstructions} defaultValue={event?.invitationInstructions ?? ""} />

          {(mode === "PHYSICAL" || mode === "HYBRID") ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Input name="locationAddress" placeholder={copy.locationAddress} defaultValue={event?.locationAddress ?? ""} />
              <Input name="latitude" type="number" step="any" placeholder={copy.latitude} defaultValue={event?.latitude ?? ""} />
              <Input name="longitude" type="number" step="any" placeholder={copy.longitude} defaultValue={event?.longitude ?? ""} />
            </div>
          ) : null}

          {(mode === "ONLINE" || mode === "HYBRID") ? (
            <Input name="meetingLink" placeholder={copy.meetingLink} defaultValue={event?.meetingLink ?? ""} />
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit">{submitLabel}</Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                {copy.cancel}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </PortalActionForm>
  );
}
