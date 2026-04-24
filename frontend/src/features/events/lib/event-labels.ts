import type { Locale } from "@/config/site";
import type {
  EventMode,
  EventPublicationStatus,
  EventStatus,
  EventVisibility,
} from "@/types/api";

export function getEventVisibilityLabel(
  locale: Locale,
  visibility: EventVisibility | string,
) {
  const labels = {
    ar: {
      PUBLIC: "عام",
      PRIVATE: "خاص",
    },
    en: {
      PUBLIC: "Public",
      PRIVATE: "Private",
    },
  } as const;

  return labels[locale][visibility as EventVisibility] ?? String(visibility);
}

export function getEventModeLabel(locale: Locale, mode: EventMode | string) {
  const labels = {
    ar: {
      PHYSICAL: "حضوري",
      ONLINE: "عبر الإنترنت",
      HYBRID: "هجين",
    },
    en: {
      PHYSICAL: "Physical",
      ONLINE: "Online",
      HYBRID: "Hybrid",
    },
  } as const;

  return labels[locale][mode as EventMode] ?? String(mode);
}

export function getEventStatusLabel(locale: Locale, status: EventStatus | string) {
  const labels = {
    ar: {
      DRAFT: "مسودة",
      PENDING_VALIDATION: "قيد التحقق",
      TENTATIVE: "مؤقت",
      CONFIRMED: "مؤكد",
      PENDING_PUBLICATION: "قيد النشر",
      PUBLISHED: "منشور",
      CANCELLED: "ملغي",
      RESCHEDULED: "أعيدت الجدولة",
      FAILED: "فشل",
    },
    en: {
      DRAFT: "Draft",
      PENDING_VALIDATION: "Pending validation",
      TENTATIVE: "Tentative",
      CONFIRMED: "Confirmed",
      PENDING_PUBLICATION: "Pending publication",
      PUBLISHED: "Published",
      CANCELLED: "Cancelled",
      RESCHEDULED: "Rescheduled",
      FAILED: "Failed",
    },
  } as const;

  return labels[locale][status as EventStatus] ?? String(status);
}

export function getEventPublicationLabel(
  locale: Locale,
  status?: EventPublicationStatus | string | null,
) {
  if (!status) {
    return locale === "ar" ? "غير محدد" : "Not set";
  }

  const labels = {
    ar: {
      NOT_ELIGIBLE: "غير مؤهل",
      ELIGIBLE: "مؤهل",
      PUBLISHED: "منشور",
      UNPUBLISHED: "غير منشور",
      REJECTED: "مرفوض",
    },
    en: {
      NOT_ELIGIBLE: "Not eligible",
      ELIGIBLE: "Eligible",
      PUBLISHED: "Published",
      UNPUBLISHED: "Unpublished",
      REJECTED: "Rejected",
    },
  } as const;

  return labels[locale][status as EventPublicationStatus] ?? String(status);
}

export function formatEventDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
