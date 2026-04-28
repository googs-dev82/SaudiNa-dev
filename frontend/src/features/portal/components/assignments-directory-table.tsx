"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Eye, MoreHorizontal, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import { AssignmentForm } from "@/features/portal/components/assignment-form";

import type {
  PortalAdminAssignment,
  PortalAdminUser,
  PortalArea,
  PortalCommittee,
  PortalRegion,
} from "@/features/portal/lib/api";
import {
  formatDateLabel,
  formatRoleLabel,
  getAssignmentScopeLabel,
} from "@/features/portal/lib/governance";
import { 
  activatePortalAssignmentAction, 
  deactivatePortalAssignmentAction, 
  deletePortalAssignmentAction 
} from "@/features/portal/lib/mutations";
import { cn } from "@/lib/utils";
import { usePortalT } from "@/features/portal/lib/use-portal-t";
import { getUserInitials } from "@/features/users/lib/users-listing";

interface AssignmentsDirectoryTableProps {
  assignments: PortalAdminAssignment[];
  users: PortalAdminUser[];
  regions: PortalRegion[];
  areas: PortalArea[];
  committees: PortalCommittee[];
}

export function AssignmentsDirectoryTable({
  assignments,
  users,
  regions,
  areas,
  committees,
}: AssignmentsDirectoryTableProps) {
  const t = usePortalT();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(assignments.map((a) => a.id));
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
      ? assignments.filter((a) => selectedIds.includes(a.id))
      : assignments;

    const tableData = selectedEntries.map((a) => {
      const user = users.find((u) => u.id === a.userId);
      const scopeLabel = getAssignmentScopeLabel(a, "en", { regions, areas, committees });
      
      return [
        user?.displayName ?? "Unknown",
        formatRoleLabel(a.roleCode),
        scopeLabel,
        `${formatDateLabel(a.activeFrom)} to ${formatDateLabel(a.activeUntil)}`,
        a.active ? "Active" : "Inactive",
      ];
    });

    doc.text(selectedIds.length > 0 ? "SaudiNA - Selected Assignments Export" : "SaudiNA - All Assignments Export", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["User", "Role", "Scope", "Window", "Status"]],
      body: tableData,
    });

    doc.save("assignments-export.pdf");
  };

  const isAllSelected = assignments.length > 0 && selectedIds.length === assignments.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-secondary/15 bg-white/80 px-4 py-2.5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          {selectedIds.length > 0 
            ? `${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"} selected`
            : "No items selected (Export will include all assignments)"
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
              <TableHead className="px-4 font-medium text-muted-foreground whitespace-nowrap">Status</TableHead>
              <TableHead className="px-4 text-right font-medium text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const assignedUser = users.find((u) => u.id === assignment.userId);
              const scopeLabel = getAssignmentScopeLabel(assignment, "en", {
                regions,
                areas,
                committees,
              });

              return (
                <TableRow key={assignment.id} className="group hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <TableCell className="px-4 py-3 align-middle">
                    <input
                      type="checkbox"
                      aria-label="Select assignment"
                      className="size-4 rounded border-muted-foreground/30 text-primary accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      checked={selectedIds.includes(assignment.id)}
                      onChange={(e) => handleSelectOne(assignment.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-xl">
                        <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">
                          {assignedUser ? getUserInitials(assignedUser.displayName) : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{assignedUser?.displayName ?? "Unknown"}</span>
                        <span className="text-[11px] text-muted-foreground">{assignedUser?.email ?? assignment.userId}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <Badge variant="secondary" className="font-medium text-[10px] py-0 px-1.5 uppercase tracking-wide">
                      {formatRoleLabel(assignment.roleCode)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 leading-tight">{assignment.scopeType}</span>
                      <span className="text-[13px] font-medium text-foreground/80">{scopeLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-[11px] font-medium text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="whitespace-nowrap">{formatDateLabel(assignment.activeFrom)}</span>
                      <span className="opacity-50 whitespace-nowrap">to {formatDateLabel(assignment.activeUntil)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                       <div className={cn("size-2 rounded-full ring-2 ring-background", assignment.active ? "bg-emerald-500" : "bg-muted-foreground")} />
                       <span className="text-sm capitalize text-muted-foreground">{assignment.active ? "active" : "inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button nativeButton={false} render={<Link href={`/portal/admin/assignments/${assignment.id}`} />} size="icon-sm" variant="ghost">
                        <Eye className="size-4" />
                        <span className="sr-only">Open details</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="group/button inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-foreground transition-all outline-none hover:bg-secondary/10 hover:text-foreground focus-visible:border-secondary/40 focus-visible:ring-3 focus-visible:ring-secondary/20">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Assignment actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Link className="flex w-full items-center" href={`/portal/admin/assignments/${assignment.id}`}>
                              Open details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <div className="px-1 py-1">
                            {assignment.active ? (
                              <PortalConfirmAction
                                action={deactivatePortalAssignmentAction}
                                description="Deactivating this assignment will immediately revoke the user's permissions for this scope."
                                fields={{ assignmentId: assignment.id }}
                                title="Deactivate this assignment?"
                                triggerLabel="Deactivate"
                                triggerVariant="ghost"
                                className="w-full justify-start text-sm shadow-none font-normal"
                              />
                            ) : (
                              <PortalConfirmAction
                                action={activatePortalAssignmentAction}
                                description="Activating this assignment will restore the user's permissions for this scope."
                                fields={{ assignmentId: assignment.id }}
                                title="Activate this assignment?"
                                triggerLabel="Activate"
                                triggerVariant="ghost"
                                className="w-full justify-start text-sm shadow-none font-normal"
                              />
                            )}
                            <PortalConfirmAction
                              action={deletePortalAssignmentAction}
                              confirmVariant="destructive"
                              description="Delete is permanent. This will remove the historical record of this assignment."
                              fields={{ assignmentId: assignment.id }}
                              title="Delete this assignment?"
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
