"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Heart,
  List,
  Map,
  MapPin,
  Monitor,
  Phone,
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
  areas: AreaDto[];
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
  { value: "MALE", label: { ar: "رجال", en: "Men" } },
  { value: "FEMALE", label: { ar: "نساء", en: "Women" } },
  { value: "MIXED", label: { ar: "مختلط", en: "Mixed" } },
] as const;

export function MeetingsExplorer({
  locale,
  meetings,
  areas,
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
    city: initialFilters.city ?? "",
    dayOfWeek: initialFilters.dayOfWeek ?? "all",
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
          filtersSubtitle: "صمّم طريقك نحو الطمأنينة",
          allMeetings: "كل الاجتماعات",
          mapView: "عرض الخريطة",
          area: "المنطقة",
          city: "المدينة",
          district: "الحي",
          type: "النوع",
          gender: "الجنس",
          weekdays: "أيام الأسبوع",
          allAreas: "كل المناطق",
          allCities: "الكل",
          allDistricts: "الكل",
          apply: "تطبيق الفلاتر",
          clear: "مسح الفلاتر",
          results: "اجتماع متاح حالياً",
          detailedList: "قائمة مفصلة",
          mapLabel: "خريطة",
          activeNow: "نشط الآن",
          nearest: "قريب منك جداً",
          details: "التفاصيل",
          join: "انضم للرابط المباشر",
          showOnMap: "عرض الموقع على الخريطة",
          contactCoordinator: "اتصل بالمنسق",
          openSeats: "آخر المقاعد",
          currentCapacity: "نسبة الامتلاء الحالية",
          seatsHint: "سارع بالحجز لضمان مكانك في هذه الورشة النوعية.",
          foundPrefix: "تم العثور على",
          foundSuffix: "اجتماعات",
          updating: "جاري التحديث",
        }
      : {
          heroKicker: "National recovery platform",
          heroTitle: "Find your calm",
          heroText:
            "This is where commitment begins. Search nearby meetings or join online circles in a space designed for privacy and support.",
          filtersTitle: "Meeting filters",
          filtersSubtitle: "Refine your sanctuary",
          allMeetings: "All meetings",
          mapView: "Map view",
          area: "Area",
          city: "City",
          district: "District",
          type: "Type",
          gender: "Gender",
          weekdays: "Weekdays",
          allAreas: "All areas",
          allCities: "All",
          allDistricts: "All",
          apply: "Apply filters",
          clear: "Clear filters",
          results: "meetings available now",
          detailedList: "Detailed list",
          mapLabel: "Map",
          activeNow: "Active now",
          nearest: "Closest to you",
          details: "Details",
          join: "Join direct link",
          showOnMap: "Show on map",
          contactCoordinator: "Contact coordinator",
          openSeats: "Almost full",
          currentCapacity: "Current fill rate",
          seatsHint:
            "Reserve your place early to secure a spot in this session.",
          foundPrefix: "Found",
          foundSuffix: "meetings",
          updating: "Updating",
        };

  const activeFilterCount = [
    draftFilters.query || undefined,
    draftFilters.city || undefined,
    draftFilters.dayOfWeek !== "all" ? draftFilters.dayOfWeek : undefined,
    draftFilters.language !== "all" ? draftFilters.language : undefined,
    draftFilters.areaId !== "all" ? draftFilters.areaId : undefined,
    draftFilters.gender !== "all" ? draftFilters.gender : undefined,
    draftFilters.mode !== "all" ? draftFilters.mode : undefined,
  ].filter(Boolean).length;

  const normalizedMeetings = useMemo(() => meetings, [meetings]);

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
      city: "",
      dayOfWeek: "all",
      language: "all",
      areaId: "all",
      gender: "all",
      mode: "all",
    });

    startTransition(() => {
      router.replace(`${pathname}${view === "map" ? "?view=map" : ""}`, {
        scroll: false,
      });
    });
  };

  const firstMapCandidate = normalizedMeetings.find(
    (meeting) =>
      typeof meeting.latitude === "number" &&
      typeof meeting.longitude === "number" &&
      !meeting.isOnline,
  );

  return (
    <main>
      <section className="border-b border-slate-200/80 bg-gradient-to-br from-primary/[0.04] via-background to-secondary/[0.03]">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
          <div className="max-w-3xl">
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.3em] text-secondary">
              {labels.heroKicker}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
              {labels.heroTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {labels.heroText}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 lg:flex-row lg:items-start lg:gap-10">
        <aside className="w-full shrink-0 self-start rounded-[2rem] border border-slate-200 bg-slate-100 lg:sticky lg:top-24 lg:w-80">
          <div className="space-y-6 p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {labels.filtersTitle}
              </h2>
              <p className="text-sm text-slate-600">{labels.filtersSubtitle}</p>
            </div>

            <div className="space-y-6 border-t border-slate-200 pt-6">
              <FilterBlock label={labels.area}>
                <select
                  aria-label={labels.area}
                  className="h-12 w-full rounded-xl border-none bg-white px-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20"
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
                  <Input
                    className="border-none bg-white shadow-none"
                    placeholder={labels.allCities}
                    value={draftFilters.city}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                  />
                </FilterBlock>
                <FilterBlock label={labels.district}>
                  <Input
                    className="border-none bg-white shadow-none"
                    placeholder={labels.allDistricts}
                    disabled
                  />
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
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={
                        draftFilters.gender === option.value
                          ? "rounded-lg bg-primary px-3 py-2 text-center text-xs font-medium text-white"
                          : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-600 transition-colors hover:border-primary hover:text-primary"
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

              <FilterBlock label={labels.weekdays}>
                <div className="flex flex-wrap gap-2">
                  <DayBubble
                    active={draftFilters.dayOfWeek === "all"}
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        dayOfWeek: "all",
                      }))
                    }
                  >
                    {locale === "ar" ? "الكل" : "All"}
                  </DayBubble>
                  {meetingDayOptions.map((option) => (
                    <DayBubble
                      key={option.value}
                      active={draftFilters.dayOfWeek === option.value}
                      onClick={() =>
                        setDraftFilters((current) => ({
                          ...current,
                          dayOfWeek: option.value,
                        }))
                      }
                    >
                      {locale === "ar"
                        ? option.label.ar.charAt(0)
                        : option.label.en.slice(0, 1)}
                    </DayBubble>
                  ))}
                </div>
              </FilterBlock>

              <FilterBlock label={locale === "ar" ? "اللغة" : "Language"}>
                <select
                  aria-label={locale === "ar" ? "اللغة" : "Language"}
                  className="h-12 w-full rounded-xl border-none bg-white px-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20"
                  value={draftFilters.language}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      language: event.target.value,
                    }))
                  }
                >
                  <option value="all">
                    {locale === "ar" ? "كل اللغات" : "All languages"}
                  </option>
                  {meetingLanguageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label[locale]}
                    </option>
                  ))}
                </select>
              </FilterBlock>

              <Input
                className="border-none bg-white shadow-none"
                placeholder={
                  locale === "ar"
                    ? "ابحث بالاسم أو المدينة"
                    : "Search by name or city"
                }
                value={draftFilters.query}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    query: event.target.value,
                  }))
                }
              />

              <Button
                className="h-14 w-full rounded-xl hero-gradient text-base font-bold text-primary-foreground"
                onClick={() => commitFilters()}
                type="button"
              >
                {labels.apply}
              </Button>

              {activeFilterCount > 0 ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={clearFilters}
                  type="button"
                >
                  {labels.clear}
                </Button>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 lg:mx-auto lg:max-w-4xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-bold text-primary">
                {normalizedMeetings.length}
              </span>{" "}
              {labels.results}
              {isPending ? ` • ${labels.updating}` : ""}
            </div>
            <div className="flex items-center rounded-full bg-muted p-1">
              <button
                type="button"
                className={
                  view === "list"
                    ? "flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary shadow-sm"
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
                    ? "flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary shadow-sm"
                    : "flex items-center gap-2 px-5 py-2 text-sm font-medium text-muted-foreground"
                }
                onClick={() => changeView("map")}
              >
                <Map className="h-4 w-4" />
                <span>{labels.mapLabel}</span>
              </button>
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
              {normalizedMeetings.map((meeting, index) => {
                const isOnline = meeting.isOnline;
                const isNearest = !isOnline && index === 1;
                const isWorkshop = !isOnline && index === 2;

                return (
                  <article
                    key={meeting.id}
                    className={
                      isOnline
                        ? "relative overflow-hidden rounded-[2rem] bg-muted p-8 transition-all hover:scale-[1.01]"
                        : "rounded-[2rem] bg-white p-8 editorial-shadow transition-all hover:scale-[1.01]"
                    }
                  >
                    {isOnline ? (
                      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5" />
                    ) : null}

                    <div className="relative z-10 flex flex-col gap-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {isOnline ? (
                            <>
                              <span className="rounded-full bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                {locale === "ar" ? "أونلاين" : "Online"}
                              </span>
                              <span className="rounded-full bg-red-100 px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
                                {locale === "ar" ? "عبر زووم" : "Via Zoom"}
                              </span>
                            </>
                          ) : isWorkshop ? (
                            <span className="rounded-full bg-red-100 px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
                              {labels.openSeats}
                            </span>
                          ) : isNearest ? (
                            <>
                              <span className="rounded-full bg-secondary/10 px-4 py-1 text-[10px] font-bold uppercase tracking-wide text-secondary">
                                {labels.nearest}
                              </span>
                              <span className="mt-1 text-xs text-muted-foreground">
                                {locale === "ar"
                                  ? "٢.٤ كم من موقعك"
                                  : "2.4 km from your location"}
                              </span>
                            </>
                          ) : null}
                        </div>

                        {isOnline ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-secondary">
                              {labels.activeNow}
                            </span>
                            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-secondary" />
                          </div>
                        ) : (
                          <Heart className="h-5 w-5 text-slate-300" />
                        )}
                      </div>

                      <div>
                        <h2 className="mb-4 text-3xl font-bold text-primary">
                          {getMeetingTitle(meeting, locale)}
                        </h2>
                        <p className="leading-8 text-muted-foreground">
                          {getMeetingDescription(meeting, locale)}
                        </p>
                      </div>

                      {isWorkshop ? (
                        <div className="space-y-5">
                          <div>
                            <div className="mb-3 flex items-end justify-between">
                              <span className="text-sm font-bold text-slate-700">
                                {labels.currentCapacity}
                              </span>
                              <span className="text-xs font-bold text-secondary">
                                {locale === "ar"
                                  ? "١٦ من أصل ٢٠ مقعد محجوز"
                                  : "16 of 20 seats reserved"}
                              </span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full w-4/5 bg-secondary" />
                            </div>
                            <p className="mt-2 text-[11px] text-slate-400">
                              {labels.seatsHint}
                            </p>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <WorkshopFeature
                              icon={MapPin}
                              text={
                                locale === "ar"
                                  ? "موقع مناسب يسهل الوصول إليه"
                                  : "Accessible venue location"
                              }
                            />
                            <WorkshopFeature
                              icon={Phone}
                              text={
                                locale === "ar"
                                  ? "تتوفر إرشادات قبل الحضور"
                                  : "Attendance guidance available"
                              }
                            />
                          </div>

                          <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-8">
                            <Button className="hero-gradient rounded-2xl px-10 py-6 text-base text-primary-foreground">
                              {locale === "ar" ? "سجل الآن" : "Register now"}
                            </Button>
                            <Button
                              className="rounded-2xl px-6 py-6"
                              variant="outline"
                            >
                              {locale === "ar"
                                ? "تعرف على المنسقين"
                                : "Meet the facilitators"}
                            </Button>
                          </div>
                        </div>
                      ) : isOnline ? (
                        <div className="space-y-6">
                          <div className="grid gap-6 rounded-2xl border border-white/60 bg-white/60 p-6 md:grid-cols-2">
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
                            className="h-14 w-full rounded-2xl bg-white text-lg font-bold text-primary hover:bg-primary hover:text-white"
                          >
                            <Link href={`/${locale}/meetings/${meeting.id}`}>
                              {labels.join}
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-6 border-t border-slate-50 pt-8 md:grid-cols-2 lg:grid-cols-3">
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

                          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-50 pt-6">
                            <div className="flex flex-wrap gap-4 text-sm font-bold">
                              <button
                                className="text-secondary transition-colors hover:text-primary"
                                type="button"
                                onClick={() =>
                                  firstMapCandidate && changeView("map")
                                }
                              >
                                {labels.showOnMap}
                              </button>
                              <button
                                className="text-slate-500 transition-colors hover:text-primary"
                                type="button"
                              >
                                {labels.contactCoordinator}
                              </button>
                            </div>
                            <Button
                              asChild
                              className="rounded-xl bg-slate-100 px-6 text-slate-900 hover:bg-slate-200"
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
          ? "rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white"
          : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary hover:text-primary"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DayBubble({
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
          ? "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-white"
          : "flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-600 transition-colors hover:border-primary hover:bg-primary hover:text-white"
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
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{value}</p>
      </div>
    </div>
  );
}

function WorkshopFeature({
  icon: Icon,
  text,
}: {
  icon: typeof MapPin;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 text-sm text-slate-600">
      <Icon className="h-5 w-5 text-secondary" />
      <span className="font-medium">{text}</span>
    </div>
  );
}

function formatGender(gender: string | null | undefined, locale: Locale) {
  const labels = {
    MALE: { ar: "رجال", en: "Men" },
    FEMALE: { ar: "نساء", en: "Women" },
    MIXED: { ar: "مختلط", en: "Mixed" },
  } as const;

  if (!gender || !(gender in labels)) {
    return locale === "ar" ? "أي" : "Any";
  }

  return labels[gender as keyof typeof labels][locale];
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
