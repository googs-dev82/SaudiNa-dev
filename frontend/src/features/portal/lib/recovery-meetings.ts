import type {
  PortalArea,
  PortalRecoveryMeeting,
  PortalRegion,
} from "@/features/portal/lib/api";

export interface RecoveryMeetingFilters {
  query: string;
  regionId: string;
  areaId: string;
  status: string;
  dayOfWeek: string;
  createdById: string;
  dateFrom: string;
  dateTo: string;
  startTimeFrom: string;
  startTimeTo: string;
}

export const defaultRecoveryMeetingFilters: RecoveryMeetingFilters = {
  query: "",
  regionId: "",
  areaId: "",
  status: "",
  dayOfWeek: "",
  createdById: "",
  dateFrom: "",
  dateTo: "",
  startTimeFrom: "",
  startTimeTo: "",
};

export type RecoveryMeetingSort =
  | "updated-desc"
  | "updated-asc"
  | "name-asc"
  | "status-asc"
  | "day-asc";

export function getRecoveryMeetingArea(
  meeting: PortalRecoveryMeeting,
  areas: PortalArea[],
) {
  return areas.find((area) => area.id === meeting.areaId) ?? null;
}

export function getRecoveryMeetingRegion(
  meeting: PortalRecoveryMeeting,
  regions: PortalRegion[],
  areas: PortalArea[],
) {
  const area = getRecoveryMeetingArea(meeting, areas);
  return regions.find((region) => region.id === (area?.regionId ?? meeting.regionId)) ?? null;
}

export function filterRecoveryMeetings(
  meetings: PortalRecoveryMeeting[],
  filters: RecoveryMeetingFilters,
) {
  return meetings.filter((meeting) => {
    const query = filters.query.trim().toLowerCase();

    if (
      query &&
      ![
        meeting.nameEn,
        meeting.nameAr,
        meeting.city,
        meeting.district ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }

    if (filters.regionId && meeting.regionId !== filters.regionId) {
      return false;
    }

    if (filters.areaId && meeting.areaId !== filters.areaId) {
      return false;
    }

    if (filters.status && meeting.status !== filters.status) {
      return false;
    }

    if (filters.dayOfWeek && meeting.dayOfWeek !== filters.dayOfWeek) {
      return false;
    }

    if (filters.createdById && meeting.createdById !== filters.createdById) {
      return false;
    }

    const updatedOn = new Date(meeting.updatedAt);
    if (filters.dateFrom) {
      const fromDate = new Date(`${filters.dateFrom}T00:00:00`);
      if (updatedOn < fromDate) {
        return false;
      }
    }

    if (filters.dateTo) {
      const toDate = new Date(`${filters.dateTo}T23:59:59`);
      if (updatedOn > toDate) {
        return false;
      }
    }

    if (filters.startTimeFrom && meeting.startTime < filters.startTimeFrom) {
      return false;
    }

    if (filters.startTimeTo && meeting.startTime > filters.startTimeTo) {
      return false;
    }

    return true;
  });
}

export function sortRecoveryMeetings(
  meetings: PortalRecoveryMeeting[],
  sort: RecoveryMeetingSort,
) {
  const sorted = [...meetings];

  sorted.sort((left, right) => {
    if (sort === "name-asc") {
      return left.nameEn.localeCompare(right.nameEn);
    }

    if (sort === "status-asc") {
      return left.status.localeCompare(right.status);
    }

    if (sort === "day-asc") {
      return left.dayOfWeek.localeCompare(right.dayOfWeek);
    }

    if (sort === "updated-asc") {
      return (
        new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()
      );
    }

    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });

  return sorted;
}

export function paginateRecoveryMeetings<T>(
  items: T[],
  page: number,
  pageSize: number,
) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function buildRecoveryMeetingFilterChips(
  filters: RecoveryMeetingFilters,
  regions: PortalRegion[],
  areas: PortalArea[],
  locale: "ar" | "en" = "en",
) {
  const copy =
    locale === "ar"
      ? {
          region: "المنطقة",
          area: "المنطقة الفرعية",
          status: "الحالة",
          day: "اليوم",
          createdBy: "أنشئ بواسطة",
          updatedFrom: "التحديث من",
          updatedTo: "التحديث إلى",
          fromTime: "من الوقت",
          toTime: "إلى الوقت",
        }
      : {
          region: "Region",
          area: "Area",
          status: "Status",
          day: "Day",
          createdBy: "Created by",
          updatedFrom: "Updated from",
          updatedTo: "Updated to",
          fromTime: "From time",
          toTime: "To time",
        };

  return [
    filters.regionId
      ? {
          key: "regionId",
          label: `${copy.region}: ${
            (locale === "ar"
              ? regions.find((region) => region.id === filters.regionId)?.nameAr
              : regions.find((region) => region.id === filters.regionId)?.nameEn) ??
            filters.regionId
          }`,
        }
      : null,
    filters.areaId
      ? {
          key: "areaId",
          label: `${copy.area}: ${
            (locale === "ar"
              ? areas.find((area) => area.id === filters.areaId)?.nameAr
              : areas.find((area) => area.id === filters.areaId)?.nameEn) ??
            filters.areaId
          }`,
        }
      : null,
    filters.status ? { key: "status", label: `${copy.status}: ${filters.status}` } : null,
    filters.dayOfWeek
      ? { key: "dayOfWeek", label: `${copy.day}: ${filters.dayOfWeek}` }
      : null,
    filters.createdById
      ? { key: "createdById", label: `${copy.createdBy}: ${filters.createdById}` }
      : null,
    filters.dateFrom
      ? { key: "dateFrom", label: `${copy.updatedFrom}: ${filters.dateFrom}` }
      : null,
    filters.dateTo
      ? { key: "dateTo", label: `${copy.updatedTo}: ${filters.dateTo}` }
      : null,
    filters.startTimeFrom
      ? { key: "startTimeFrom", label: `${copy.fromTime}: ${filters.startTimeFrom}` }
      : null,
    filters.startTimeTo
      ? { key: "startTimeTo", label: `${copy.toTime}: ${filters.startTimeTo}` }
      : null,
  ].filter((value): value is { key: keyof RecoveryMeetingFilters; label: string } =>
    Boolean(value),
  );
}
