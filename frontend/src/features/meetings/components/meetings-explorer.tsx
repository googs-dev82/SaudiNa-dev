"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CalendarDays,
  Download,
  type LucideIcon,
  List,
  Map,
  MapPin,
  Monitor,
  RotateCcw,
  Search,
  UserRound,
  Video,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AreaDto, Locale, MeetingDto } from "@/types/api";
import {
  getMeetingDescription,
  getMeetingTitle,
  meetingDayOptions,
  meetingLanguageOptions,
  meetingModeOptions,
} from "@/features/meetings/lib/meeting-filters";

const MeetingsMap = dynamic(
  () =>
    import("@/features/meetings/components/meetings-map").then(
      (module) => module.MeetingsMap,
    ),
  { ssr: false },
);

type MeetingsExplorerProps = {
  locale: Locale;
  meetings: MeetingDto[];
  weeklyMeetings?: MeetingDto[];
  areas: AreaDto[];
  defaultDayOfWeek?: string;
  initialFilters: {
    query?: string;
    city?: string;
    dayOfWeek?: string;
    language?: string;
    areaId?: string;
    gender?: string;
    mode?: string;
    view?: string;
  };
};

type DraftFilters = {
  query: string;
  city: string;
  dayOfWeek: string;
  language: string;
  areaId: string;
  gender: string;
  mode: string;
};

const genderOptions = [
  { value: "MALE", label: { ar: "رجال فقط", en: "Male-only" } },
  { value: "FEMALE", label: { ar: "نساء فقط", en: "Women-only" } },
  { value: "MIXED", label: { ar: "مختلط", en: "Mixed" } },
] as const;

export function MeetingsExplorer({
  locale,
  meetings,
  weeklyMeetings = meetings,
  areas,
  defaultDayOfWeek = "all",
  initialFilters,
}: MeetingsExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<"list" | "map">(
    initialFilters.view === "map" ? "map" : "list",
  );
  const [draftFilters, setDraftFilters] = useState<DraftFilters>({
    query: initialFilters.query ?? "",
    city: initialFilters.city ?? "all",
    dayOfWeek: initialFilters.dayOfWeek ?? defaultDayOfWeek,
    language: initialFilters.language ?? "all",
    areaId: initialFilters.areaId ?? "all",
    gender: initialFilters.gender ?? "all",
    mode: initialFilters.mode ?? "all",
  });

  const labels =
    locale === "ar"
      ? {
          heroKicker: "زمالة المدمنين المجهولين",
          heroTitle: "ابحث عن اقرب اجتماع",
          heroText:
            "هنا تبدأ رحلة الالتزام. ابحث عن الاجتماعات القريبة منك أو انضم إلى حلقاتنا عبر الإنترنت في بيئة آمنة وداعمة تماماً.",
          filtersTitle: "مرشحات الاجتماعات",
          filtersSubtitle: "اختر المدينة أو اليوم أو نوع الحضور للوصول للاجتماع المناسب.",
          allMeetings: "كل الاجتماعات",
          mapView: "عرض الخريطة",
          area: "المنطقة",
          city: "المدينة",
          district: "الحي",
          type: "النوع",
          gender: "الجنس",
          weekdays: "أيام الأسبوع",
          allDays: "كل الأيام",
          downloadPdf: "تحميل PDF للأسبوع الحالي",
          allAreas: "كل المناطق",
          allCities: "الكل",
          allDistricts: "الكل",
          apply: "تطبيق الفلاتر",
          clear: "مسح الفلاتر",
          results: "اجتماع متاح",
          detailedList: "قائمة مفصلة",
          mapLabel: "خريطة",
          activeNow: "نشط الآن",
          details: "التفاصيل",
          join: "عرض تفاصيل الاجتماع",
          showOnMap: "عرض الموقع على الخريطة",
          foundPrefix: "تم العثور على",
          foundSuffix: "اجتماعات",
          updating: "جاري التحديث",
          searchPlaceholder: "اسم الاجتماع أو المدينة",
        }
      : {
          heroKicker: "Narcotics Anonymous Saudi Arabia",
          heroTitle: "Find a meeting",
          heroText:
            "Search in-person and online meetings across Saudi Arabia. Use the filters to find a time, place, and format that works for you.",
          filtersTitle: "Meeting filters",
          filtersSubtitle: "Choose a city, day, language, or attendance type to narrow the list.",
          allMeetings: "All meetings",
          mapView: "Map view",
          area: "Area",
          city: "City",
          district: "District",
          type: "Type",
          gender: "Gender",
          weekdays: "Weekdays",
          allDays: "All days",
          downloadPdf: "Download this week as PDF",
          allAreas: "All areas",
          allCities: "All",
          allDistricts: "All",
          apply: "Apply filters",
          clear: "Clear filters",
          results: "meetings available",
          detailedList: "Detailed list",
          mapLabel: "Map",
          activeNow: "Active now",
          details: "Details",
          join: "View meeting details",
          showOnMap: "Show on map",
          foundPrefix: "Found",
          foundSuffix: "meetings",
          updating: "Updating",
          searchPlaceholder: "Meeting name or city",
        };

  const activeFilterCount = [
    draftFilters.query || undefined,
    draftFilters.city !== "all" ? draftFilters.city : undefined,
    draftFilters.dayOfWeek !== defaultDayOfWeek ? draftFilters.dayOfWeek : undefined,
    draftFilters.language !== "all" ? draftFilters.language : undefined,
    draftFilters.areaId !== "all" ? draftFilters.areaId : undefined,
    draftFilters.gender !== "all" ? draftFilters.gender : undefined,
    draftFilters.mode !== "all" ? draftFilters.mode : undefined,
  ].filter(Boolean).length;

  const normalizedMeetings = useMemo(() => meetings, [meetings]);
  const cityOptions = useMemo(
    () =>
      Array.from(new Set(weeklyMeetings.map((meeting) => meeting.city).filter(Boolean)))
        .sort((first, second) => first.localeCompare(second, locale === "ar" ? "ar" : "en")),
    [locale, weeklyMeetings],
  );
  const weekRange = useMemo(() => getCurrentWeekRange(locale), [locale]);

  const commitFilters = (nextView = view) => {
    const next = new URLSearchParams(searchParams.toString());

    const entries = {
      query: draftFilters.query.trim() || undefined,
      city: draftFilters.city.trim() || undefined,
      dayOfWeek: draftFilters.dayOfWeek,
      language: draftFilters.language,
      areaId: draftFilters.areaId,
      gender: draftFilters.gender,
      mode: draftFilters.mode,
      view: nextView,
    };

    Object.entries(entries).forEach(([key, value]) => {
      if (!value || value === "all" || value === "list") {
        if (key === "view" && value === "map") {
          next.set(key, value);
          return;
        }
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  };

  const changeView = (nextView: "list" | "map") => {
    setView(nextView);
    commitFilters(nextView);
  };

  const clearFilters = () => {
    setDraftFilters({
      query: "",
      city: "all",
      dayOfWeek: defaultDayOfWeek,
      language: "all",
      areaId: "all",
      gender: "all",
      mode: "all",
    });

    startTransition(() => {
      const next = new URLSearchParams();
      next.set("dayOfWeek", defaultDayOfWeek);
      if (view === "map") next.set("view", "map");
      router.replace(`${pathname}?${next.toString()}`, {
        scroll: false,
      });
    });
  };

  const downloadWeeklyPdf = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    await loadArabicPdfFont(doc);
    const title = locale === "ar" ? "قائمة اجتماعات الأسبوع" : "Weekly Meetings List";
    const dateRange = `${weekRange.from} - ${weekRange.to}`;
    const tableHead =
      locale === "ar"
        ? [["اللغة", "الفئة", "النوع", "المدينة", "الاجتماع", "الوقت", "اليوم"]]
        : [["Day", "Time", "Meeting", "City", "Format", "Audience", "Language"]];
    const tableBody = sortMeetingsByWeekday(weeklyMeetings).map((meeting) => {
      const row = [
        formatDayName(meeting.dayOfWeek, locale),
        `${meeting.startTime}${meeting.endTime ? ` - ${meeting.endTime}` : ""}`,
        getMeetingTitle(meeting, locale),
        `${meeting.city}${meeting.district ? ` / ${meeting.district}` : ""}`,
        meeting.isOnline ? (locale === "ar" ? "افتراضي" : "Online") : (locale === "ar" ? "حضوري" : "In person"),
        formatGender(meeting.gender, locale),
        formatLanguage(meeting.language, locale),
      ];

      return locale === "ar" ? [...row].reverse() : row;
    });

    doc.setR2L(false);
    doc.setFillColor(88, 129, 87);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 86, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("SaudiNAArabic", "normal");
    doc.setFontSize(20);
    doc.text(title, locale === "ar" ? doc.internal.pageSize.getWidth() - 40 : 40, 36, {
      align: locale === "ar" ? "right" : "left",
    });
    doc.setFontSize(11);
    doc.setFont(locale === "ar" ? "helvetica" : "SaudiNAArabic", "normal");
    doc.text(locale === "ar" ? dateRange : `Date from - date to: ${dateRange}`, locale === "ar" ? doc.internal.pageSize.getWidth() - 40 : 40, 58, {
      align: locale === "ar" ? "right" : "left",
    });
    doc.setFont("SaudiNAArabic", "normal");

    autoTable(doc, {
      startY: 108,
      head: tableHead,
      body: tableBody,
      styles: {
        font: "SaudiNAArabic",
        fontSize: 9,
        cellPadding: 7,
        textColor: [27, 36, 44],
        lineColor: [220, 226, 218],
        lineWidth: 0.5,
        halign: locale === "ar" ? "right" : "left",
      },
      headStyles: {
        fillColor: [49, 92, 63],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [246, 249, 244],
      },
      margin: { left: 40, right: 40 },
      didDrawPage: () => {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(90, 108, 100);
        doc.setFont("SaudiNAArabic", "normal");
        doc.text(locale === "ar" ? "زمالة المدمنين المجهولين - السعودية" : "Narcotics Anonymous Saudi Arabia", locale === "ar" ? doc.internal.pageSize.getWidth() - 40 : 40, pageHeight - 24, {
          align: locale === "ar" ? "right" : "left",
        });
      },
    });

    doc.save(`saudina-weekly-meetings-${weekRange.fileFrom}-${weekRange.fileTo}.pdf`);
  };

  const firstMapCandidate = normalizedMeetings.find(
    (meeting) =>
      typeof meeting.latitude === "number" &&
      typeof meeting.longitude === "number" &&
      !meeting.isOnline,
  );

  return (
    <main className="bg-background">
      <section className="border-b border-secondary/15 bg-[linear-gradient(135deg,rgba(88,129,87,0.14),rgba(253,252,249,0.96)_48%,rgba(88,129,87,0.08))]">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 md:px-8 md:py-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
              {labels.heroKicker}
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {labels.heroTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {labels.heroText}
            </p>
          </div>
          <div className="rounded-lg border border-secondary/20 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              {labels.foundPrefix}
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {normalizedMeetings.length}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 lg:flex-row lg:items-start lg:gap-8">
        <aside className="w-full shrink-0 self-start rounded-lg border border-secondary/20 bg-[linear-gradient(180deg,rgba(88,129,87,0.10),rgba(255,255,255,0.96))] shadow-sm lg:sticky lg:top-24 lg:w-88">
          <div className="space-y-5 p-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {labels.filtersTitle}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{labels.filtersSubtitle}</p>
            </div>

            <div className="space-y-5 border-t border-secondary/15 pt-5">
              <FilterBlock label={labels.weekdays}>
                <div className="grid grid-cols-2 gap-2">
                  <DayButton
                    active={draftFilters.dayOfWeek === "all"}
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        dayOfWeek: "all",
                      }))
                    }
                  >
                    {labels.allDays}
                  </DayButton>
                  {meetingDayOptions.map((option) => (
                    <DayButton
                      key={option.value}
                      active={draftFilters.dayOfWeek === option.value}
                      onClick={() =>
                        setDraftFilters((current) => ({
                          ...current,
                          dayOfWeek: option.value,
                        }))
                      }
                    >
                      {option.label[locale]}
                    </DayButton>
                  ))}
                </div>
              </FilterBlock>

              <FilterBlock label={locale === "ar" ? "بحث" : "Search"}>
                <div className="relative">
                  <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-secondary" />
                  <Input
                    className="h-12 rounded-lg border-secondary/20 bg-white ps-10 shadow-none focus-visible:ring-secondary/25"
                    placeholder={labels.searchPlaceholder}
                    value={draftFilters.query}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        query: event.target.value,
                      }))
                    }
                  />
                </div>
              </FilterBlock>

              <FilterBlock label={labels.area}>
                <select
                  aria-label={labels.area}
                  className="h-12 w-full rounded-lg border border-secondary/20 bg-white px-4 text-sm text-foreground focus:ring-2 focus:ring-secondary/20"
                  value={draftFilters.areaId}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      areaId: event.target.value,
                    }))
                  }
                >
                  <option value="all">{labels.allAreas}</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {locale === "ar" ? area.nameAr : area.nameEn}
                    </option>
                  ))}
                </select>
              </FilterBlock>

              <div className="grid grid-cols-2 gap-3">
                <FilterBlock label={labels.city}>
                  <select
                    aria-label={labels.city}
                    className="h-12 w-full rounded-lg border border-secondary/20 bg-white px-3 text-sm text-foreground focus:ring-2 focus:ring-secondary/20"
                    value={draftFilters.city}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                  >
                    <option value="all">{labels.allCities}</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </FilterBlock>
                <FilterBlock label={locale === "ar" ? "اللغة" : "Language"}>
                  <select
                    aria-label={locale === "ar" ? "اللغة" : "Language"}
                    className="h-12 w-full rounded-lg border border-secondary/20 bg-white px-3 text-sm text-foreground focus:ring-2 focus:ring-secondary/20"
                    value={draftFilters.language}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        language: event.target.value,
                      }))
                    }
                  >
                    <option value="all">
                      {locale === "ar" ? "كل اللغات" : "All"}
                    </option>
                    {meetingLanguageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label[locale]}
                      </option>
                    ))}
                  </select>
                </FilterBlock>
              </div>

              <FilterBlock label={labels.type}>
                <div className="flex flex-wrap gap-2">
                  {meetingModeOptions.map((option) => (
                    <PillButton
                      key={option.value}
                      active={draftFilters.mode === option.value}
                      onClick={() =>
                        setDraftFilters((current) => ({
                          ...current,
                          mode: option.value,
                        }))
                      }
                    >
                      {option.label[locale]}
                    </PillButton>
                  ))}
                </div>
              </FilterBlock>

              <FilterBlock label={labels.gender}>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={
                      draftFilters.gender === "all"
                        ? "rounded-lg bg-secondary px-3 py-2.5 text-center text-xs font-semibold text-white shadow-sm"
                        : "rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-secondary/40 hover:text-secondary"
                    }
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        gender: "all",
                      }))
                    }
                  >
                    {locale === "ar" ? "الكل" : "All"}
                  </button>
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={
                        draftFilters.gender === option.value
                          ? "rounded-lg bg-secondary px-3 py-2.5 text-center text-xs font-semibold text-white shadow-sm"
                          : "rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-secondary/40 hover:text-secondary"
                      }
                      onClick={() =>
                        setDraftFilters((current) => ({
                          ...current,
                          gender: option.value,
                        }))
                      }
                    >
                      {option.label[locale]}
                    </button>
                  ))}
                </div>
              </FilterBlock>

              <Button
                className="h-12 w-full rounded-lg bg-secondary text-base font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90"
                onClick={() => commitFilters()}
                type="button"
              >
                {labels.apply}
              </Button>

              {activeFilterCount > 0 ? (
                <Button
                  className="w-full rounded-lg border-secondary/20 bg-white text-foreground hover:bg-secondary/10 hover:text-secondary"
                  variant="outline"
                  onClick={clearFilters}
                  type="button"
                >
                  <RotateCcw data-icon="inline-start" />
                  {labels.clear}
                </Button>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 lg:mx-auto lg:max-w-4xl">
          <div className="mb-6 flex flex-col gap-4 rounded-lg border border-secondary/15 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-secondary">
                {normalizedMeetings.length}
              </span>{" "}
              {labels.results}
              {isPending ? ` • ${labels.updating}` : ""}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                className="rounded-lg border-secondary/20 bg-white text-foreground hover:bg-secondary/10 hover:text-secondary"
                variant="outline"
                onClick={downloadWeeklyPdf}
                type="button"
              >
                <Download data-icon="inline-start" />
                {labels.downloadPdf}
              </Button>
              <div className="flex items-center rounded-lg bg-secondary/10 p-1">
                <button
                  type="button"
                  className={
                    view === "list"
                      ? "flex items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-semibold text-foreground shadow-sm"
                      : "flex items-center gap-2 px-5 py-2 text-sm font-medium text-muted-foreground"
                  }
                  onClick={() => changeView("list")}
                >
                  <List className="h-4 w-4" />
                  <span>{labels.detailedList}</span>
                </button>
                <button
                  type="button"
                  className={
                    view === "map"
                      ? "flex items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-semibold text-foreground shadow-sm"
                      : "flex items-center gap-2 px-5 py-2 text-sm font-medium text-muted-foreground"
                  }
                  onClick={() => changeView("map")}
                >
                  <Map className="h-4 w-4" />
                  <span>{labels.mapLabel}</span>
                </button>
              </div>
            </div>
          </div>

          {normalizedMeetings.length === 0 ? (
            <EmptyState
              title={
                locale === "ar" ? "لا توجد نتائج حالياً" : "No meetings found"
              }
              description={
                locale === "ar"
                  ? "حاول تعديل الفلاتر أو العودة لاحقاً."
                  : "Try changing the filters or check back later."
              }
            />
          ) : view === "map" ? (
            <MeetingsMap locale={locale} meetings={normalizedMeetings} />
          ) : (
            <div className="flex flex-col gap-8">
              {normalizedMeetings.map((meeting) => {
                const isOnline = meeting.isOnline;

                return (
                  <article
                    key={meeting.id}
                    className={
                      isOnline
                        ? "relative overflow-hidden rounded-lg border border-secondary/20 bg-[linear-gradient(135deg,rgba(88,129,87,0.12),rgba(255,255,255,0.96))] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        : "rounded-lg border border-border/55 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-md"
                    }
                  >
                    {isOnline ? (
                      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/10" />
                    ) : null}

                    <div className="relative z-10 flex flex-col gap-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {isOnline ? (
                            <>
                              <span className="rounded-full bg-secondary px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                {locale === "ar" ? "أونلاين" : "Online"}
                              </span>
                              <span className="rounded-full bg-white px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground">
                                {locale === "ar" ? "عبر زووم" : "Via Zoom"}
                              </span>
                            </>
                          ) : (
                            <span className="rounded-full bg-secondary/10 px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary">
                              {locale === "ar" ? "حضوري" : "In person"}
                            </span>
                          )}
                        </div>

                        {isOnline ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-secondary">
                              {labels.activeNow}
                            </span>
                            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-secondary" />
                          </div>
                        ) : (
                          <MapPin className="h-5 w-5 text-secondary" />
                        )}
                      </div>

                      <div>
                        <h2 className="mb-3 text-2xl font-semibold text-foreground md:text-3xl">
                          {getMeetingTitle(meeting, locale)}
                        </h2>
                        <p className="leading-7 text-muted-foreground">
                          {getMeetingDescription(meeting, locale)}
                        </p>
                      </div>

                      {isOnline ? (
                        <div className="space-y-6">
                          <div className="grid gap-5 rounded-lg border border-white/70 bg-white/70 p-5 md:grid-cols-2">
                            <MeetingInfo
                              icon={Video}
                              label={locale === "ar" ? "المنصة" : "Platform"}
                              value={
                                meeting.meetingLink
                                  ? locale === "ar"
                                    ? "رابط مباشر آمن"
                                    : "Secure direct link"
                                  : locale === "ar"
                                    ? "يتم إرسال الرابط بعد التسجيل"
                                    : "Link is shared after registration"
                              }
                            />
                            <MeetingInfo
                              icon={CalendarDays}
                              label={locale === "ar" ? "الموعد" : "Schedule"}
                              value={`${meeting.dayOfWeek} • ${meeting.startTime}${meeting.endTime ? ` - ${meeting.endTime}` : ""}`}
                            />
                            <MeetingInfo
                              icon={UserRound}
                              label={
                                locale === "ar" ? "الفئة المستهدفة" : "Audience"
                              }
                              value={formatGender(meeting.gender, locale)}
                            />
                            <MeetingInfo
                              icon={Monitor}
                              label={locale === "ar" ? "اللغة" : "Language"}
                              value={formatLanguage(meeting.language, locale)}
                            />
                          </div>

                          <Button
                            asChild
                            className="h-12 w-full rounded-lg bg-secondary text-base font-semibold text-secondary-foreground hover:bg-secondary/90"
                          >
                            <Link href={`/${locale}/meetings/${meeting.id}`}>
                              {labels.join}
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-5 border-t border-border/45 pt-6 md:grid-cols-2 lg:grid-cols-3">
                            <MeetingInfo
                              icon={CalendarDays}
                              label={locale === "ar" ? "الموعد" : "Schedule"}
                              value={`${meeting.dayOfWeek} • ${meeting.startTime}${meeting.endTime ? ` - ${meeting.endTime}` : ""}`}
                            />
                            <MeetingInfo
                              icon={MapPin}
                              label={locale === "ar" ? "الموقع" : "Location"}
                              value={`${meeting.city}${meeting.district ? ` • ${meeting.district}` : ""}`}
                            />
                            <MeetingInfo
                              icon={UserRound}
                              label={locale === "ar" ? "الفئة" : "Audience"}
                              value={formatGender(meeting.gender, locale)}
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/45 pt-5">
                            <div className="flex flex-wrap gap-4 text-sm font-semibold">
                              <button
                                className="text-secondary transition-colors hover:text-foreground"
                                type="button"
                                onClick={() =>
                                  firstMapCandidate && changeView("map")
                                }
                              >
                                {labels.showOnMap}
                              </button>
                            </div>
                            <Button
                              asChild
                              className="rounded-lg bg-secondary/10 px-6 text-foreground hover:bg-secondary hover:text-white"
                              variant="ghost"
                            >
                              <Link href={`/${locale}/meetings/${meeting.id}`}>
                                {labels.details}
                              </Link>
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}

function PillButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
          : "rounded-full border border-secondary/15 bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-secondary/40 hover:text-secondary"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DayButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "rounded-lg bg-secondary px-3 py-2.5 text-center text-xs font-semibold text-white shadow-sm"
          : "rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-secondary/40 hover:bg-secondary hover:text-white"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MeetingInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function formatGender(gender: string | null | undefined, locale: Locale) {
  const labels = {
    MALE: { ar: "رجال فقط", en: "Male-only" },
    FEMALE: { ar: "نساء فقط", en: "Women-only" },
    MIXED: { ar: "مختلط", en: "Mixed" },
  } as const;

  if (!gender || !(gender in labels)) {
    return locale === "ar" ? "أي" : "Any";
  }

  return labels[gender as keyof typeof labels][locale];
}

const weekdayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekdayAliases: Record<string, string> = {
  SUN: "Sunday",
  SUNDAY: "Sunday",
  MON: "Monday",
  MONDAY: "Monday",
  TUE: "Tuesday",
  TUESDAY: "Tuesday",
  WED: "Wednesday",
  WEDNESDAY: "Wednesday",
  THU: "Thursday",
  THURSDAY: "Thursday",
  FRI: "Friday",
  FRIDAY: "Friday",
  SAT: "Saturday",
  SATURDAY: "Saturday",
};

function normalizeWeekday(day: string) {
  return weekdayAliases[day.trim().toUpperCase()] ?? day;
}

function sortMeetingsByWeekday(meetings: MeetingDto[]) {
  return [...meetings].sort((first, second) => {
    const firstDay = weekdayOrder.indexOf(normalizeWeekday(first.dayOfWeek));
    const secondDay = weekdayOrder.indexOf(normalizeWeekday(second.dayOfWeek));

    if (firstDay !== secondDay) {
      return firstDay - secondDay;
    }

    return first.startTime.localeCompare(second.startTime);
  });
}

function formatDayName(day: string, locale: Locale) {
  const option = meetingDayOptions.find((item) => item.value === normalizeWeekday(day));
  return option?.label[locale] ?? day;
}

function getCurrentWeekRange(locale: Locale) {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    weekday: "long",
  }).format(now);
  const riyadhParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => Number(riyadhParts.find((entry) => entry.type === type)?.value);
  const today = new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
  const start = addDays(today, -Math.max(weekdayOrder.indexOf(weekday), 0));
  const end = addDays(start, 6);
  const formatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    timeZone: "UTC",
    dateStyle: "medium",
  });

  return {
    from: locale === "ar" ? toDisplayDate(start) : formatter.format(start),
    to: locale === "ar" ? toDisplayDate(end) : formatter.format(end),
    fileFrom: toFileDate(start),
    fileTo: toFileDate(end),
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toFileDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDisplayDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "/");
}

async function loadArabicPdfFont(doc: jsPDF) {
  const response = await fetch("/fonts/noto-sans-arabic.ttf");
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  doc.addFileToVFS("noto-sans-arabic.ttf", btoa(binary));
  doc.addFont("noto-sans-arabic.ttf", "SaudiNAArabic", "normal");
  doc.addFont("noto-sans-arabic.ttf", "SaudiNAArabic", "bold");
  doc.setFont("SaudiNAArabic", "normal");
}

function formatLanguage(language: string | null | undefined, locale: Locale) {
  const labels = {
    ARABIC: { ar: "اللغة العربية", en: "Arabic" },
    ENGLISH: { ar: "اللغة الإنجليزية", en: "English" },
    BILINGUAL: { ar: "ثنائي اللغة", en: "Bilingual" },
  } as const;

  if (!language || !(language in labels)) {
    return locale === "ar" ? "غير محدد" : "Not specified";
  }

  return labels[language as keyof typeof labels][locale];
}
