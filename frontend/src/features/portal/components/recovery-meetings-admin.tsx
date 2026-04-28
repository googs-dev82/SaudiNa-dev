"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  PortalArea,
  PortalRecoveryMeeting,
  PortalRegion,
} from "@/features/portal/lib/api";
import {
  buildRecoveryMeetingFilterChips,
  defaultRecoveryMeetingFilters,
  filterRecoveryMeetings,
  getRecoveryMeetingArea,
  getRecoveryMeetingRegion,
  paginateRecoveryMeetings,
  sortRecoveryMeetings,
  type RecoveryMeetingFilters,
  type RecoveryMeetingSort,
} from "@/features/portal/lib/recovery-meetings";
import { RecoveryMeetingDialog } from "./recovery-meeting-dialog";
import { RecoveryMeetingActions } from "./recovery-meeting-actions";
import { GovernanceMetricCard, GovernanceMetricGrid, GovernancePageHeader } from "./governance-ui";

const selectClassName =
  "h-12 rounded-lg border border-secondary/20 bg-white px-4 text-sm text-foreground shadow-sm focus-visible:border-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/20";

function statusTone(status: string) {
  if (status === "PUBLISHED") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "ARCHIVED") {
    return "bg-secondary/10 text-primary";
  }

  return "bg-amber-100 text-amber-800";
}

function dayOptions(locale: "ar" | "en") {
  return locale === "ar"
    ? [
        ["Sunday", "الأحد"],
        ["Monday", "الاثنين"],
        ["Tuesday", "الثلاثاء"],
        ["Wednesday", "الأربعاء"],
        ["Thursday", "الخميس"],
        ["Friday", "الجمعة"],
        ["Saturday", "السبت"],
      ] as const
    : [
        ["Sunday", "Sunday"],
        ["Monday", "Monday"],
        ["Tuesday", "Tuesday"],
        ["Wednesday", "Wednesday"],
        ["Thursday", "Thursday"],
        ["Friday", "Friday"],
        ["Saturday", "Saturday"],
      ] as const;
}

function formatDayLabel(value: string, locale: "ar" | "en") {
  const labels = Object.fromEntries(dayOptions(locale)) as Record<string, string>;
  return labels[value] ?? value;
}

function formatLanguageLabel(value: string, locale: "ar" | "en") {
  if (locale === "ar") {
    if (value === "ARABIC") return "العربية";
    if (value === "ENGLISH") return "الإنجليزية";
    if (value === "BILINGUAL") return "ثنائي اللغة";
  }

  return value;
}

interface RecoveryMeetingsAdminProps {
  meetings: PortalRecoveryMeeting[];
  regions: PortalRegion[];
  areas: PortalArea[];
  canManage: boolean;
  locale: "ar" | "en";
}

export function RecoveryMeetingsAdmin({
  meetings,
  regions,
  areas,
  canManage,
  locale,
}: RecoveryMeetingsAdminProps) {
  const [filters, setFilters] = useState<RecoveryMeetingFilters>(
    defaultRecoveryMeetingFilters,
  );
  const [sort, setSort] = useState<RecoveryMeetingSort>("updated-desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  const filteredMeetings = useMemo(
    () => filterRecoveryMeetings(meetings, filters),
    [meetings, filters],
  );
  const sortedMeetings = useMemo(
    () => sortRecoveryMeetings(filteredMeetings, sort),
    [filteredMeetings, sort],
  );
  const pagedMeetings = useMemo(
    () => paginateRecoveryMeetings(sortedMeetings, page, pageSize),
    [sortedMeetings, page, pageSize],
  );
  const activeChips = useMemo(
    () => buildRecoveryMeetingFilterChips(filters, regions, areas, locale),
    [filters, regions, areas, locale],
  );

  const publishedCount = meetings.filter((meeting) => meeting.status === "PUBLISHED").length;
  const draftCount = meetings.filter((meeting) => meeting.status === "DRAFT").length;
  const archivedCount = meetings.filter((meeting) => meeting.status === "ARCHIVED").length;
  const totalPages = Math.max(1, Math.ceil(sortedMeetings.length / pageSize));
  const dayLabels = dayOptions(locale);

  const copy =
    locale === "ar"
      ? {
          eyebrow: "العمليات",
          title: "اجتماعات التعافي",
          description: "إدارة سجلات الاجتماعات العامة من شاشة واحدة منظمة تشبه بقية البوابة الإدارية.",
          breadcrumb: ["البوابة", "العمليات", "اجتماعات التعافي"],
          addLabel: "إضافة اجتماع",
          addTitle: "إنشاء اجتماع تعافٍ",
          addDescription: "افتح النموذج المنسق لإنشاء سجل جديد أو مسودة قابلة للنشر لاحقًا.",
          filtersTitle: "المرشحات",
          filtersDescription: "تضييق مجموعة العمل بسرعة.",
          reset: "إعادة الضبط",
          search: "ابحث بالاسم أو المدينة أو الحي",
          allRegions: "جميع المناطق",
          allAreas: "جميع المناطق الفرعية",
          allStatuses: "جميع الحالات",
          allDays: "جميع الأيام",
          createdBy: "أنشئ بواسطة",
          updatedFrom: "التحديث من",
          updatedTo: "التحديث إلى",
          fromTime: "من الوقت",
          toTime: "إلى الوقت",
          directoryTitle: "دليل الاجتماعات",
          matched: (count: number) => `${count} سجل مطابق`,
          noMeetingsTitle: "لا توجد اجتماعات بعد",
          noMeetingsDescription: "ابدأ بإنشاء أول اجتماع تعافٍ ضمن النطاق التشغيلي.",
          noResultsTitle: "لا توجد نتائج",
          noResultsDescription: "حاول توسيع المرشحات أو إعادة التحديد الحالي.",
          page: "الصفحة",
          of: "من",
          previous: "السابق",
          next: "التالي",
          meeting: "الاجتماع",
          region: "المنطقة",
          area: "المنطقة الفرعية",
          city: "المدينة",
          day: "اليوم",
          time: "الوقت",
          status: "الحالة",
          language: "اللغة",
          createdByLabel: "أنشئ بواسطة",
          actions: "الإجراءات",
          view: "عرض",
          edit: "تعديل",
          disable: "تعطيل",
          delete: "حذف",
          noDescription: "لم تتم إضافة وصف لهذا الاجتماع بعد.",
          openDetails: "فتح التفاصيل",
          format: "النوع",
          online: "عبر الإنترنت",
          inPerson: "حضوري",
          lastUpdated: "آخر تحديث",
          statusPublished: "منشور",
          statusDraft: "مسودة",
          statusArchived: "مؤرشف",
        }
      : {
          eyebrow: "Operations",
          title: "Recovery meetings",
          description: "Manage public meeting records from one organized register that feels aligned with the rest of the admin portal.",
          breadcrumb: ["Portal", "Operations", "Recovery meetings"],
          addLabel: "Add meeting",
          addTitle: "Create recovery meeting",
          addDescription: "Open the structured form to create a new record or a draft that can be published later.",
          filtersTitle: "Filters",
          filtersDescription: "Narrow the working set quickly.",
          reset: "Reset",
          search: "Search name, city, district",
          allRegions: "All regions",
          allAreas: "All areas",
          allStatuses: "All statuses",
          allDays: "All days",
          createdBy: "Created by",
          updatedFrom: "Updated from",
          updatedTo: "Updated to",
          fromTime: "From time",
          toTime: "To time",
          directoryTitle: "Meeting directory",
          matched: (count: number) => `${count} meeting${count === 1 ? "" : "s"} matched`,
          noMeetingsTitle: "No meetings yet",
          noMeetingsDescription: "Start by creating the first recovery meeting for your operational scope.",
          noResultsTitle: "No results",
          noResultsDescription: "Try widening the filters or resetting the current selection.",
          page: "Page",
          of: "of",
          previous: "Previous",
          next: "Next",
          meeting: "Meeting",
          region: "Region",
          area: "Area",
          city: "City",
          day: "Day",
          time: "Time",
          status: "Status",
          language: "Language",
          createdByLabel: "Created by",
          actions: "Actions",
          view: "View",
          edit: "Edit",
          disable: "Disable",
          delete: "Delete",
          noDescription: "No description has been added for this meeting yet.",
          openDetails: "Open details",
          format: "Format",
          online: "Online",
          inPerson: "In-person",
          lastUpdated: "Last updated",
          statusPublished: "Published",
          statusDraft: "Draft",
          statusArchived: "Archived",
        };

  return (
    <>
      <div className="space-y-6" dir={locale}>
        <GovernancePageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          breadcrumb={copy.breadcrumb}
          primaryAction={
            canManage ? (
              <Button className="shadow-sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 size-4" />
                {copy.addLabel}
              </Button>
            ) : null
          }
        />

        <GovernanceMetricGrid>
          <GovernanceMetricCard
            label={copy.statusPublished}
            value={publishedCount}
            hint={locale === "ar" ? "السجلات المنشورة والمتاحة للاكتشاف." : "Records available for public discovery."}
          />
          <GovernanceMetricCard
            label={copy.statusDraft}
            value={draftCount}
            hint={locale === "ar" ? "المسودات الجاهزة للمراجعة أو النشر." : "Drafts ready for review or publication."}
          />
          <GovernanceMetricCard
            label={copy.statusArchived}
            value={archivedCount}
            hint={locale === "ar" ? "السجلات المعطلة أو المؤرشفة." : "Disabled or archived records."}
          />
          <GovernanceMetricCard
            label={locale === "ar" ? "الإجمالي" : "Total"}
            value={meetings.length}
            hint={locale === "ar" ? "جميع السجلات المتاحة ضمن النطاق." : "All records currently available in scope."}
          />
        </GovernanceMetricGrid>

        <Card className="bg-white">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-primary">{copy.filtersTitle}</h2>
                <p className="text-sm text-muted-foreground">{copy.filtersDescription}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  className={selectClassName}
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as RecoveryMeetingSort)
                  }
                >
                  <option value="updated-desc">{locale === "ar" ? "آخر تحديث" : "Last updated"}</option>
                  <option value="updated-asc">{locale === "ar" ? "الأقدم تحديثًا" : "Oldest updated"}</option>
                  <option value="name-asc">{locale === "ar" ? "الاسم" : "Name"}</option>
                  <option value="status-asc">{locale === "ar" ? "الحالة" : "Status"}</option>
                  <option value="day-asc">{locale === "ar" ? "اليوم" : "Day"}</option>
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFilters(defaultRecoveryMeetingFilters);
                    setPage(1);
                  }}
                >
                  {copy.reset}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
              <Input
                value={filters.query}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, query: event.target.value }));
                  setPage(1);
                }}
                placeholder={copy.search}
              />

              <select
                className={selectClassName}
                value={filters.regionId}
                onChange={(event) => {
                  setFilters((current) => ({
                    ...current,
                    regionId: event.target.value,
                    areaId: "",
                  }));
                  setPage(1);
                }}
              >
                <option value="">{copy.allRegions}</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {locale === "ar" ? region.nameAr : region.nameEn}
                  </option>
                ))}
              </select>

              <select
                className={selectClassName}
                value={filters.areaId}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, areaId: event.target.value }));
                  setPage(1);
                }}
              >
                <option value="">{copy.allAreas}</option>
                {areas
                  .filter((area) =>
                    filters.regionId ? area.regionId === filters.regionId : true,
                  )
                  .map((area) => (
                    <option key={area.id} value={area.id}>
                      {locale === "ar" ? area.nameAr : area.nameEn}
                    </option>
                  ))}
              </select>

              <select
                className={selectClassName}
                value={filters.status}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, status: event.target.value }));
                  setPage(1);
                }}
              >
                <option value="">{copy.allStatuses}</option>
                <option value="DRAFT">{locale === "ar" ? "مسودة" : "Draft"}</option>
                <option value="PUBLISHED">{locale === "ar" ? "منشور" : "Published"}</option>
                <option value="ARCHIVED">{locale === "ar" ? "مؤرشف" : "Archived"}</option>
              </select>

              <select
                className={selectClassName}
                value={filters.dayOfWeek}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, dayOfWeek: event.target.value }));
                  setPage(1);
                }}
              >
                <option value="">{copy.allDays}</option>
                {dayLabels.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <Input
                value={filters.createdById}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, createdById: event.target.value }));
                  setPage(1);
                }}
                placeholder={copy.createdBy}
              />

              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) => {
                    setFilters((current) => ({ ...current, dateFrom: event.target.value }));
                    setPage(1);
                  }}
                />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) => {
                    setFilters((current) => ({ ...current, dateTo: event.target.value }));
                    setPage(1);
                  }}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  type="time"
                  value={filters.startTimeFrom}
                  onChange={(event) => {
                    setFilters((current) => ({
                      ...current,
                      startTimeFrom: event.target.value,
                    }));
                    setPage(1);
                  }}
                  placeholder={copy.fromTime}
                />
                <Input
                  type="time"
                  value={filters.startTimeTo}
                  onChange={(event) => {
                    setFilters((current) => ({
                      ...current,
                      startTimeTo: event.target.value,
                    }));
                    setPage(1);
                  }}
                  placeholder={copy.toTime}
                />
              </div>
            </div>

            {activeChips.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary"
                    onClick={() => {
                      setFilters((current) => ({ ...current, [chip.key]: "" }));
                      setPage(1);
                    }}
                  >
                    {chip.label}
                    <span className="text-primary/60">×</span>
                  </button>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-white">
          <CardContent className="p-0">
            {pagedMeetings.length === 0 ? (
              <div className="p-8">
                <h3 className="text-2xl font-bold text-primary">
                  {meetings.length === 0 ? copy.noMeetingsTitle : copy.noResultsTitle}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {meetings.length === 0 ? copy.noMeetingsDescription : copy.noResultsDescription}
                </p>
                {meetings.length === 0 && canManage ? (
                  <div className="mt-5">
                    <Button onClick={() => setCreateOpen(true)}>
                      <Plus className="mr-2 size-4" />
                      {copy.addLabel}
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-1 border-b border-border/30 px-5 py-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-primary">{copy.directoryTitle}</h3>
                    <p className="text-sm text-muted-foreground">{copy.matched(sortedMeetings.length)}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-4 font-medium text-muted-foreground">
                          {copy.meeting}
                        </TableHead>
                        <TableHead className="px-4 font-medium text-muted-foreground">
                          {copy.region}
                        </TableHead>
                        <TableHead className="px-4 font-medium text-muted-foreground">
                          {copy.city}
                        </TableHead>
                        <TableHead className="px-4 font-medium text-muted-foreground">
                          {copy.day}
                        </TableHead>
                        <TableHead className="px-4 font-medium text-muted-foreground">
                          {copy.time}
                        </TableHead>
                        <TableHead className="px-4 font-medium text-muted-foreground">
                          {copy.status}
                        </TableHead>
                        <TableHead className="px-4 font-medium text-muted-foreground">
                          {copy.language}
                        </TableHead>
                        <TableHead className="px-4 font-medium text-muted-foreground">
                          {copy.createdByLabel}
                        </TableHead>
                        <TableHead className="px-4 text-right font-medium text-muted-foreground">
                          {copy.actions}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedMeetings.map((meeting) => {
                      const area = getRecoveryMeetingArea(meeting, areas);
                      const region = getRecoveryMeetingRegion(meeting, regions, areas);

                      return (
                        <TableRow
                          key={meeting.id}
                          className="group hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <TableCell className="px-4 py-4 align-middle">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {locale === "ar" ? meeting.nameAr : meeting.nameEn}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {locale === "ar" ? meeting.nameEn : meeting.nameAr}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 align-middle">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {locale === "ar"
                                  ? area?.nameAr ?? (locale === "ar" ? "منطقة غير معروفة" : "Unknown area")
                                  : area?.nameEn ?? "Unknown area"}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {locale === "ar"
                                  ? region?.nameAr ?? (locale === "ar" ? "منطقة غير معروفة" : "Unknown region")
                                  : region?.nameEn ?? "Unknown region"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 align-middle text-sm text-muted-foreground">
                            {meeting.city}
                          </TableCell>
                          <TableCell className="px-4 py-4 align-middle text-sm text-muted-foreground">
                            {formatDayLabel(meeting.dayOfWeek, locale)}
                          </TableCell>
                          <TableCell className="px-4 py-4 align-middle text-sm text-muted-foreground">
                            {meeting.startTime}
                            {meeting.endTime ? ` - ${meeting.endTime}` : ""}
                          </TableCell>
                          <TableCell className="px-4 py-4 align-middle">
                            <Badge className={statusTone(meeting.status)}>
                              {meeting.status === "PUBLISHED"
                                ? copy.statusPublished
                                : meeting.status === "ARCHIVED"
                                  ? copy.statusArchived
                                  : copy.statusDraft}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-4 align-middle text-sm text-muted-foreground">
                            {formatLanguageLabel(meeting.language, locale)}
                          </TableCell>
                          <TableCell className="px-4 py-4 align-middle text-sm text-muted-foreground">
                            {meeting.createdById}
                          </TableCell>
                          <TableCell className="px-4 py-4 align-middle text-right">
                            <RecoveryMeetingActions
                              areas={areas}
                              locale={locale}
                              meeting={meeting}
                              regions={regions}
                            />
                          </TableCell>
                        </TableRow>
                      );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {copy.page} {page} {copy.of} {totalPages}
          </p>
          <div className="flex gap-2">
            <select
              className={selectClassName}
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value="10">{locale === "ar" ? "10 / صفحة" : "10 / page"}</option>
              <option value="20">{locale === "ar" ? "20 / صفحة" : "20 / page"}</option>
              <option value="50">{locale === "ar" ? "50 / صفحة" : "50 / page"}</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              {copy.previous}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
            >
              {copy.next}
            </Button>
          </div>
        </div>
      </div>

      <RecoveryMeetingDialog
        areas={areas}
        locale={locale}
        onOpenChange={setCreateOpen}
        open={createOpen}
        regions={regions}
      />
    </>
  );
}
