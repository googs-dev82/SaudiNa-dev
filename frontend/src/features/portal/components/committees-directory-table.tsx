"use client";

import { useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Eye, MoreHorizontal, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

import type {
  PortalAdminAssignment,
  PortalAdminUser,
  PortalArea,
  PortalCommittee,
  PortalRegion,
} from "@/features/portal/lib/api";
import { formatDateLabel } from "@/features/portal/lib/governance";
import { 
  activatePortalCommitteeAction, 
  deactivatePortalCommitteeAction, 
  deletePortalCommitteeAction 
} from "@/features/portal/lib/mutations";
import { cn } from "@/lib/utils";
import { usePortalT } from "@/features/portal/lib/use-portal-t";

const committeeLevels = ["REGIONAL", "AREA"] as const;

interface CommitteesDirectoryTableProps {
  committees: PortalCommittee[];
  regions: PortalRegion[];
  areas: PortalArea[];
  assignments: PortalAdminAssignment[];
  users: PortalAdminUser[];
}

export function CommitteesDirectoryTable({
  committees,
  regions,
  areas,
  assignments,
  users,
}: CommitteesDirectoryTableProps) {
  const t = usePortalT();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(committees.map((c) => c.id));
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
      ? committees.filter((c) => selectedIds.includes(c.id))
      : committees;

    const tableData = selectedEntries.map((c) => {
      const region = regions.find((r) => r.id === c.regionId);
      const area = areas.find((a) => a.id === c.areaId);
      const memberCount = assignments.filter(
        (a) => a.scopeType === "COMMITTEE" && a.scopeId === c.id && a.active,
      ).length;

      return [
        c.nameEn,
        c.code,
        c.level,
        region?.nameEn ?? "—",
        area?.nameEn ?? "—",
        memberCount.toString(),
        c.isActive ? "Active" : "Inactive",
        formatDateLabel(c.updatedAt),
      ];
    });

    doc.text(selectedIds.length > 0 ? "SaudiNA - Selected Committees Export" : "SaudiNA - All Committees Export", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Code", "Level", "Region", "Area", "Members", "Status", "Last Updated"]],
      body: tableData,
    });

    doc.save("committees-export.pdf");
  };

  const isAllSelected = committees.length > 0 && selectedIds.length === committees.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-secondary/15 bg-white/80 px-4 py-2.5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          {selectedIds.length > 0 
            ? `${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"} selected`
            : "No items selected (Export will include all committees)"
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
            {committees.map((committee) => {
              const region = regions.find((r) => r.id === committee.regionId);
              const area = areas.find((a) => a.id === committee.areaId);
              const memberCount = assignments.filter(
                (a) => a.scopeType === "COMMITTEE" && a.scopeId === committee.id && a.active,
              ).length;

              return (
                <TableRow key={committee.id} className="group hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <TableCell className="px-4 py-3 align-middle">
                    <input
                      type="checkbox"
                      aria-label="Select committee"
                      className="size-4 rounded border-muted-foreground/30 text-primary accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      checked={selectedIds.includes(committee.id)}
                      onChange={(e) => handleSelectOne(committee.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-xl">
                        <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">
                          {committee.code.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{committee.nameEn}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">
                          {committee.code}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <Badge variant="outline" className="text-[10px] py-0 font-medium tracking-tight">
                      {committee.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-xs text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{region?.nameEn ?? "—"}</span>
                      {area && <span className="opacity-70">{area.nameEn}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {memberCount}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2 rounded-full ring-2 ring-background", committee.isActive ? "bg-emerald-500" : "bg-muted-foreground")} />
                      <span className="text-sm capitalize text-muted-foreground">{committee.isActive ? "active" : "inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateLabel(committee.updatedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button nativeButton={false} render={<Link href={`/portal/admin/committees/${committee.id}`} />} size="icon-sm" variant="ghost">
                        <Eye className="size-4" />
                        <span className="sr-only">Open details</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="group/button inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-foreground transition-all outline-none hover:bg-secondary/10 hover:text-foreground focus-visible:border-secondary/40 focus-visible:ring-3 focus-visible:ring-secondary/20">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Committee actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Link className="flex w-full items-center" href={`/portal/admin/committees/${committee.id}`}>
                              Open details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <div className="px-1 py-1">
                            {committee.isActive ? (
                              <PortalConfirmAction
                                action={deactivatePortalCommitteeAction}
                                description="Deactivating this committee will hide it from the public site."
                                fields={{ committeeId: committee.id }}
                                title="Deactivate this committee?"
                                triggerLabel="Deactivate"
                                triggerVariant="ghost"
                                className="w-full justify-start text-sm shadow-none font-normal"
                              />
                            ) : (
                              <PortalConfirmAction
                                action={activatePortalCommitteeAction}
                                description="Activating this committee will restore its public visibility."
                                fields={{ committeeId: committee.id }}
                                title="Activate this committee?"
                                triggerLabel="Activate"
                                triggerVariant="ghost"
                                className="w-full justify-start text-sm shadow-none font-normal"
                              />
                            )}
                            <PortalConfirmAction
                              action={deletePortalCommitteeAction}
                              confirmVariant="destructive"
                              description="Delete is only allowed if the committee has no operational records."
                              fields={{ committeeId: committee.id }}
                              title="Delete this committee?"
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
