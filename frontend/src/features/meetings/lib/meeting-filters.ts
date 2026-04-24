import type { Locale, MeetingDto } from "@/types/api";

export const meetingDayOptions = [
  { value: "Sunday", label: { ar: "الأحد", en: "Sunday" } },
  { value: "Monday", label: { ar: "الاثنين", en: "Monday" } },
  { value: "Tuesday", label: { ar: "الثلاثاء", en: "Tuesday" } },
  { value: "Wednesday", label: { ar: "الأربعاء", en: "Wednesday" } },
  { value: "Thursday", label: { ar: "الخميس", en: "Thursday" } },
  { value: "Friday", label: { ar: "الجمعة", en: "Friday" } },
  { value: "Saturday", label: { ar: "السبت", en: "Saturday" } },
] as const;

export const meetingLanguageOptions = [
  { value: "ARABIC", label: { ar: "العربية", en: "Arabic" } },
  { value: "ENGLISH", label: { ar: "الإنجليزية", en: "English" } },
  { value: "BILINGUAL", label: { ar: "ثنائي اللغة", en: "Bilingual" } },
] as const;

export const meetingModeOptions = [
  { value: "all", label: { ar: "الكل", en: "All" } },
  { value: "in-person", label: { ar: "حضوري", en: "In person" } },
  { value: "online", label: { ar: "افتراضي", en: "Online" } },
] as const;

export const getMeetingTitle = (meeting: MeetingDto, locale: Locale) =>
  locale === "ar" ? meeting.nameAr : meeting.nameEn;

export const getMeetingDescription = (meeting: MeetingDto, locale: Locale) =>
  locale === "ar" ? meeting.descriptionAr : meeting.descriptionEn;
