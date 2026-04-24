"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PortalActionForm } from "@/features/portal/components/portal-action-form";
import { RecoveryLocationPicker } from "@/features/portal/components/recovery-location-picker";
import type {
  PortalActionState,
} from "@/features/portal/lib/action-state";
import type {
  PortalArea,
  PortalRecoveryMeeting,
  PortalRegion,
} from "@/features/portal/lib/api";

const meetingLanguages = ["ARABIC", "ENGLISH", "BILINGUAL"] as const;
const meetingGenders = ["MALE", "FEMALE", "MIXED"] as const;
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function getLocalizedDayLabel(day: string, locale: "ar" | "en") {
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
      }[day] ?? day
    );
  }

  return day;
}

function getLocalizedLanguageLabel(language: string, locale: "ar" | "en") {
  if (locale === "ar") {
    return (
      {
        ARABIC: "العربية",
        ENGLISH: "الإنجليزية",
        BILINGUAL: "ثنائي اللغة",
      }[language] ?? language
    );
  }

  return language;
}

function getLocalizedGenderLabel(gender: string, locale: "ar" | "en") {
  if (locale === "ar") {
    return (
      {
        MALE: "رجال",
        FEMALE: "نساء",
        MIXED: "مختلط",
      }[gender] ?? gender
    );
  }

  return gender;
}

interface RecoveryMeetingEditorProps {
  action: (
    previousState: PortalActionState,
    formData: FormData,
  ) => Promise<PortalActionState>;
  regions: PortalRegion[];
  areas: PortalArea[];
  meeting?: PortalRecoveryMeeting;
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  compact?: boolean;
  locale?: "ar" | "en";
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-border/30 bg-muted/10">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
            {number}
          </div>
          <div>
            <h4 className="text-base font-semibold text-primary">{title}</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

const selectClassName =
  "h-12 rounded-xl border border-border/40 bg-white px-4 text-sm text-foreground shadow-sm focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10";

export function RecoveryMeetingEditor({
  action,
  regions,
  areas,
  meeting,
  title,
  description,
  submitLabel,
  successMessage,
  onCancel,
  onSuccess,
  compact = false,
  locale = "en",
}: RecoveryMeetingEditorProps) {
  const [isOnline, setIsOnline] = useState(Boolean(meeting?.isOnline));
  const copy =
    locale === "ar"
      ? {
          basicInfo: "المعلومات الأساسية",
          basicInfoDesc: "أعطِ الاجتماع اسمًا ثنائي اللغة واضحًا وسياقًا اختياريًا للمشغلين.",
          selectRegion: "اختر المنطقة",
          selectArea: "اختر المنطقة الفرعية",
          nameEn: "اسم الاجتماع (EN)",
          nameAr: "اسم الاجتماع (AR)",
          city: "المدينة",
          district: "الحي",
          descriptionEn: "الوصف (EN)",
          descriptionAr: "الوصف (AR)",
          attributes: "سمات الاجتماع",
          attributesDesc: "اضبط الجمهور واللغة والنمط كي تظل عوامل التصفية دقيقة.",
          onlineMeeting: "اجتماع عبر الإنترنت",
          linkTitle: "رابط الاجتماع",
          locationTitle: "الموقع",
          locationDesc: "الاجتماعات الحضورية تحتاج عنوانًا واضحًا وإحداثيات خريطة.",
          meetingLink: "رابط الاجتماع",
          addressEn: "العنوان (EN)",
          addressAr: "العنوان (AR)",
          mapNote: "يمكن إضافة منتقي الخريطة لاحقًا، لكن الإحداثيات مدعومة بالفعل من الخلفية.",
          cancel: "إلغاء",
          save: "حفظ التغييرات",
        }
      : {
          basicInfo: "Basic Info",
          basicInfoDesc: "Give the meeting a clear bilingual name and optional context for operators.",
          selectRegion: "Select region",
          selectArea: "Select area",
          nameEn: "Meeting name (English)",
          nameAr: "Meeting name (Arabic)",
          city: "City",
          district: "District",
          descriptionEn: "Description (English)",
          descriptionAr: "Description (Arabic)",
          attributes: "Meeting Attributes",
          attributesDesc: "Set the audience, language, and format so discovery filters stay accurate.",
          onlineMeeting: "Online meeting",
          linkTitle: "Meeting Link",
          locationTitle: "Location",
          locationDesc: "In-person meetings should have both readable address fields and map coordinates.",
          meetingLink: "Meeting link",
          addressEn: "Address (English)",
          addressAr: "Address (Arabic)",
          mapNote: "Map picker can be added next, but coordinates are already supported and validated by the backend.",
          cancel: "Cancel",
          save: "Save changes",
        };

  return (
    <PortalActionForm
      action={action}
      className="space-y-5"
      successMessage={successMessage}
      onSuccess={onSuccess}
    >
      {meeting ? <input name="meetingId" type="hidden" value={meeting.id} /> : null}

      {title || description ? (
        <div className="space-y-2">
          {title ? <h3 className="text-2xl font-bold text-primary">{title}</h3> : null}
          {description ? (
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={compact ? "space-y-4" : "space-y-5"}>
        <Section
          number="01"
          title={copy.basicInfo}
          description={copy.basicInfoDesc}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <select
              name="regionId"
              className={selectClassName}
              defaultValue={meeting?.regionId ?? ""}
              required
            >
              <option disabled value="">
                {copy.selectRegion}
              </option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {locale === "ar" ? region.nameAr : region.nameEn}
                </option>
              ))}
            </select>
            <select
              name="areaId"
              className={selectClassName}
              defaultValue={meeting?.areaId ?? ""}
              required
            >
              <option disabled value="">
                {copy.selectArea}
              </option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {locale === "ar" ? area.nameAr : area.nameEn}
                </option>
              ))}
            </select>
            <Input
              name="nameEn"
              placeholder={copy.nameEn}
              defaultValue={meeting?.nameEn ?? ""}
              required
            />
            <Input
              name="nameAr"
              placeholder={copy.nameAr}
              defaultValue={meeting?.nameAr ?? ""}
              required
            />
            <Input
              name="city"
              placeholder={copy.city}
              defaultValue={meeting?.city ?? ""}
              required
            />
            <Input
              name="district"
              placeholder={copy.district}
              defaultValue={meeting?.district ?? ""}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <select
              name="dayOfWeek"
              className={selectClassName}
              defaultValue={meeting?.dayOfWeek ?? "Sunday"}
            >
              {weekdays.map((day) => (
                <option key={day} value={day}>
                  {getLocalizedDayLabel(day, locale)}
                </option>
              ))}
            </select>
            <Input
              name="startTime"
              type="time"
              defaultValue={meeting?.startTime ?? ""}
              required
            />
            <Input
              name="endTime"
              type="time"
              defaultValue={meeting?.endTime ?? ""}
            />
          </div>
          <div className="grid gap-4">
            <Textarea
              name="descriptionEn"
              placeholder={copy.descriptionEn}
              defaultValue={meeting?.descriptionEn ?? ""}
            />
            <Textarea
              name="descriptionAr"
              placeholder={copy.descriptionAr}
              defaultValue={meeting?.descriptionAr ?? ""}
            />
          </div>

        </Section>

        <Section
          number="02"
          title={copy.attributes}
          description={copy.attributesDesc}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <select
              name="gender"
              className={selectClassName}
              defaultValue={meeting?.gender ?? "MIXED"}
            >
              {meetingGenders.map((gender) => (
                <option key={gender} value={gender}>
                  {getLocalizedGenderLabel(gender, locale)}
                </option>
              ))}
            </select>
            <select
              name="language"
              className={selectClassName}
              defaultValue={meeting?.language ?? "ARABIC"}
            >
              {meetingLanguages.map((language) => (
                <option key={language} value={language}>
                  {getLocalizedLanguageLabel(language, locale)}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-3 rounded-xl border border-border/40 bg-white px-4 py-3 text-sm text-foreground shadow-sm">
              <input
                checked={isOnline}
                name="isOnline"
                type="checkbox"
                onChange={(event) => setIsOnline(event.target.checked)}
              />
              {copy.onlineMeeting}
            </label>
          </div>
          
        </Section>

       

        

        <Section
          number="03"
          title={isOnline ? copy.linkTitle : copy.locationTitle}
          description={
            isOnline
              ? (locale === "ar" ? "الاجتماعات عبر الإنترنت تحتاج رابطًا موثوقًا للحضور." : "Online meetings require a reliable join link for attendees.")
              : copy.locationDesc
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            
            {isOnline ? (
              <Input
                name="meetingLink"
                placeholder="https://..."
                defaultValue={meeting?.meetingLink ?? ""}
                className="md:col-span-2"
              />
            ) : (
              <>
                <Input
                  name="addressEn"
                  placeholder={copy.addressEn}
                  defaultValue={meeting?.addressEn ?? ""}
                />
                <Input
                  name="addressAr"
                  placeholder={copy.addressAr}
                  defaultValue={meeting?.addressAr ?? ""}
                />
                <div className="md:col-span-2">
                  <RecoveryLocationPicker
                    latitude={meeting?.latitude}
                    longitude={meeting?.longitude}
                  />
                </div>
              </>
            )}
          </div>
          {!isOnline ? (
            <div className="rounded-2xl border border-dashed border-border/50 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
              {copy.mapNote}
            </div>
          ) : null}
        </Section>
  
         
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/30 pt-4">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {copy.cancel}
          </Button>
        ) : null}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </PortalActionForm>
  );
}
