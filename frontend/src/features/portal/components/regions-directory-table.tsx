"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Eye, MoreHorizontal, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";

import type { PortalArea, PortalRegion } from "@/features/portal/lib/api";
import { formatDateLabel } from "@/features/portal/lib/governance";
import { 
  activatePortalRegionAction, 
  deactivatePortalRegionAction, 
  deletePortalRegionAction 
} from "@/features/portal/lib/mutations";
import { cn } from "@/lib/utils";
import { usePortalT } from "@/features/portal/lib/use-portal-t";

interface RegionsDirectoryTableProps {
  regions: PortalRegion[];
  areas: PortalArea[];
}

export function RegionsDirectoryTable({ regions, areas }: RegionsDirectoryTableProps) {
  const t = usePortalT();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(regions.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const selectedEntries = selectedIds.length > 0 
      ? regions.filter((r) => selectedIds.includes(r.id))
      : regions;

    const tableData = selectedEntries.map((r) => {
      const areaCount = areas.filter((area) => area.regionId === r.id).length;
      return [
        r.nameEn,
        r.nameAr,
        r.code,
        areaCount.toString(),
        r.isActive ? "Active" : "Inactive",
        formatDateLabel(r.updatedAt),
      ];
    });

    doc.text(selectedIds.length > 0 ? "SaudiNA - Selected Regions Export" : "SaudiNA - All Regions Export", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Name (En)", "Name (Ar)", "Code", "Areas", "Status", "Last Updated"]],
      body: tableData,
    });

    doc.save("regions-export.pdf");
  };

  const isAllSelected = regions.length > 0 && selectedIds.length === regions.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-secondary/15 bg-white/80 px-4 py-2.5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          {selectedIds.length > 0 
            ? `${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"} selected`
            : "No items selected (Export will include all regions)"
          }
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExportPDF} className="h-8 shadow-sm">
            <Download className="mr-1 size-4" />
            {t("action.exportPDF")}
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  className="size-4 rounded border-muted-foreground/30 text-primary accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground whitespace-nowrap">{t("label.updatedAt")}</TableHead>
              <TableHead className="px-4 text-right font-medium text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regions.map((region) => {
              const areaCount = areas.filter((area) => area.regionId === region.id).length;
              return (
                <TableRow key={region.id} className="group hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <TableCell className="px-4 py-3 align-middle">
                    <input
                      type="checkbox"
                      aria-label="Select region"
                      className="size-4 rounded border-muted-foreground/30 text-primary accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      checked={selectedIds.includes(region.id)}
                      onChange={(e) => handleSelectOne(region.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-xl">
                        <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">
                          {region.code.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{region.nameEn}</span>
                        <span className="text-[11px] text-muted-foreground" dir="rtl">{region.nameAr}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <Badge variant="outline" className="font-mono text-[10px] font-medium tracking-wider text-muted-foreground">
                      {region.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {areaCount}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2 rounded-full ring-2 ring-background", region.isActive ? "bg-emerald-500" : "bg-muted-foreground")} />
                      <span className="text-sm capitalize text-muted-foreground">{region.isActive ? t("label.active") : t("label.inactive")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateLabel(region.updatedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                         <Button nativeButton={false} render={<Link href={`/portal/admin/locations/regions/${region.id}`} />} size="icon-sm" variant="ghost">
                          <Eye className="size-4" />
                          <span className="sr-only">{t("action.viewDetails")}</span>
                        </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="group/button inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-foreground transition-all outline-none hover:bg-secondary/10 hover:text-foreground focus-visible:border-secondary/40 focus-visible:ring-3 focus-visible:ring-secondary/20">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">{t("regions.actions.label")}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Link className="flex w-full items-center" href={`/portal/admin/locations/regions/${region.id}`}>
                              {t("action.viewDetails")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <div className="px-1 py-1">
                            {region.isActive ? (
                              <PortalConfirmAction
                                action={deactivatePortalRegionAction}
                                description={t("regions.deactivate.desc")}
                                fields={{ regionId: region.id }}
                                title={t("regions.deactivate.title")}
                                triggerLabel={t("action.deactivate")}
                                triggerVariant="ghost"
                                className="w-full justify-start text-sm shadow-none font-normal"
                              />
                            ) : (
                              <PortalConfirmAction
                                action={activatePortalRegionAction}
                                description={t("regions.deactivate.desc")}
                                fields={{ regionId: region.id }}
                                title={t("regions.deactivate.title")}
                                triggerLabel={t("action.activate")}
                                triggerVariant="ghost"
                                className="w-full justify-start text-sm shadow-none font-normal"
                              />
                            )}
                            <PortalConfirmAction
                              action={deletePortalRegionAction}
                              confirmVariant="destructive"
                              description={t("regions.delete.desc")}
                              fields={{ regionId: region.id }}
                              title={t("regions.delete.title")}
                              triggerLabel={t("action.delete")}
                              triggerVariant="ghost"
                              className="mt-1 w-full justify-start text-sm shadow-none font-normal text-destructive hover:text-destructive hover:bg-destructive/5"
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
