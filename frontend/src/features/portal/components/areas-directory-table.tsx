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

import type { PortalArea, PortalCommittee, PortalRegion } from "@/features/portal/lib/api";
import { formatDateLabel } from "@/features/portal/lib/governance";
import { 
  activatePortalAreaAction, 
  deactivatePortalAreaAction, 
  deletePortalAreaAction 
} from "@/features/portal/lib/mutations";
import { cn } from "@/lib/utils";
import { usePortalT } from "@/features/portal/lib/use-portal-t";

interface AreasDirectoryTableProps {
  areas: PortalArea[];
  regions: PortalRegion[];
  committees: PortalCommittee[];
}

export function AreasDirectoryTable({ areas, regions, committees }: AreasDirectoryTableProps) {
  const t = usePortalT();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(areas.map((a) => a.id));
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
      ? areas.filter((a) => selectedIds.includes(a.id))
      : areas;

    const tableData = selectedEntries.map((a) => {
      const region = regions.find((r) => r.id === a.regionId);
      const committeeCount = committees.filter((c) => c.areaId === a.id).length;
      return [
        a.nameEn,
        a.nameAr,
        a.code,
        region?.nameEn ?? "Unknown",
        committeeCount.toString(),
        a.isActive ? "Active" : "Inactive",
        formatDateLabel(a.updatedAt),
      ];
    });

    doc.text(selectedIds.length > 0 ? "SaudiNA - Selected Areas Export" : "SaudiNA - All Areas Export", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Name (En)", "Name (Ar)", "Code", "Region", "Committees", "Status", "Last Updated"]],
      body: tableData,
    });

    doc.save("areas-export.pdf");
  };

  const isAllSelected = areas.length > 0 && selectedIds.length === areas.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2.5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          {selectedIds.length > 0 
            ? `${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"} selected`
            : "No items selected (Export will include all areas)"
          }
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExportPDF} className="h-8 shadow-sm">
            <Download className="mr-1 size-4" />
            Export PDF
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
              <TableHead className="px-4 font-medium text-muted-foreground whitespace-nowrap">Last updated</TableHead>
              <TableHead className="px-4 text-right font-medium text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map((area) => {
              const region = regions.find((r) => r.id === area.regionId);
              const committeeCount = committees.filter((c) => c.areaId === area.id).length;
              return (
                <TableRow key={area.id} className="group hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <TableCell className="px-4 py-3 align-middle">
                    <input
                      type="checkbox"
                      aria-label="Select area"
                      className="size-4 rounded border-muted-foreground/30 text-primary accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      checked={selectedIds.includes(area.id)}
                      onChange={(e) => handleSelectOne(area.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-xl">
                        <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">
                          {area.code.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{area.nameEn}</span>
                        <span className="text-[11px] text-muted-foreground" dir="rtl">{area.nameAr}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <Badge variant="outline" className="font-mono text-[10px] font-medium tracking-wider text-muted-foreground">
                      {area.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {region?.nameEn ?? "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {committeeCount}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2 rounded-full ring-2 ring-background", area.isActive ? "bg-emerald-500" : "bg-muted-foreground")} />
                      <span className="text-sm capitalize text-muted-foreground">{area.isActive ? "active" : "inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateLabel(area.updatedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button nativeButton={false} render={<Link href={`/portal/admin/locations/areas/${area.id}`} />} size="icon-sm" variant="ghost">
                        <Eye className="size-4" />
                        <span className="sr-only">Open details</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="group/button inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] text-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Area actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Link className="flex w-full items-center" href={`/portal/admin/locations/areas/${area.id}`}>
                              Open details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <div className="px-1 py-1">
                            {area.isActive ? (
                              <PortalConfirmAction
                                action={deactivatePortalAreaAction}
                                description="Deactivating this area will hide its committees from the public site."
                                fields={{ areaId: area.id }}
                                title="Deactivate this area?"
                                triggerLabel="Deactivate"
                                triggerVariant="ghost"
                                className="w-full justify-start text-sm shadow-none font-normal"
                              />
                            ) : (
                              <PortalConfirmAction
                                action={activatePortalAreaAction}
                                description="Activating this area will restore visibility for its committees."
                                fields={{ areaId: area.id }}
                                title="Activate this area?"
                                triggerLabel="Activate"
                                triggerVariant="ghost"
                                className="w-full justify-start text-sm shadow-none font-normal"
                              />
                            )}
                            <PortalConfirmAction
                              action={deletePortalAreaAction}
                              confirmVariant="destructive"
                              description="Delete is only allowed if the area has no dependent committees or operational records."
                              fields={{ areaId: area.id }}
                              title="Delete this area?"
                              triggerLabel="Delete"
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
