"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, MoreHorizontal, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import { GovernancePill } from "@/features/portal/components/governance-ui";
import {
  activatePortalUserAction,
  deactivatePortalUserAction,
  deletePortalUserAction,
} from "@/features/portal/lib/mutations";
import type { UsersDirectoryEntry } from "@/features/users/lib/users-listing";
import { getUserInitials } from "@/features/users/lib/users-listing";

interface UsersDirectoryTableProps {
  entries: UsersDirectoryEntry[];
}

export function UsersDirectoryTable({ entries }: UsersDirectoryTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(entries.map((e) => e.user.id));
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
      ? entries.filter((e) => selectedIds.includes(e.user.id))
      : entries;

    const tableData = selectedEntries.map((e) => [
      e.user.displayName,
      e.user.email,
      e.roleLabels.join(", ") || "—",
      e.scopeSummary.join(", ") || "—",
      e.user.status,
      e.user.lastLoginAt
        ? new Intl.DateTimeFormat("en-SA", { dateStyle: "medium" }).format(new Date(e.user.lastLoginAt))
        : "Never",
    ]);

    doc.text(selectedIds.length > 0 ? "SaudiNA - Selected Users Export" : "SaudiNA - All Users Export", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Email", "Roles", "Scopes", "Status", "Last Login"]],
      body: tableData,
    });

    doc.save("users-export.pdf");
  };

  const isAllSelected = entries.length > 0 && selectedIds.length === entries.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2.5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          {selectedIds.length > 0 
            ? `${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"} selected`
            : "No items selected (Export will include all filtered users)"
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
            <TableHead className="px-4 font-medium text-muted-foreground">User</TableHead>
            <TableHead className="px-4 font-medium text-muted-foreground">Roles</TableHead>
            <TableHead className="px-4 font-medium text-muted-foreground">Scopes</TableHead>
            <TableHead className="px-4 font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="px-4 font-medium text-muted-foreground whitespace-nowrap">Last login</TableHead>
            <TableHead className="px-4 text-right font-medium text-muted-foreground"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map(({ user, assignmentCount, roleLabels, scopeSummary }) => (
            <TableRow key={user.id} className="group hover:bg-muted/50 data-[state=selected]:bg-muted">
              <TableCell className="px-4 py-3 align-middle">
                <input
                  type="checkbox"
                  aria-label="Select user"
                  className="size-4 rounded border-muted-foreground/30 text-primary accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  checked={selectedIds.includes(user.id)}
                  onChange={(e) => handleSelectOne(user.id, e.target.checked)}
                />
              </TableCell>
              <TableCell className="px-4 py-3 align-middle">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-muted text-xs font-medium text-foreground">{getUserInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{user.displayName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 align-middle">
                <div className="flex flex-wrap gap-1">
                  {roleLabels.length ? (
                    roleLabels.map((role) => <Badge key={role} variant="secondary" className="font-normal">{role}</Badge>)
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 align-middle">
                <div className="flex flex-wrap gap-1">
                  {scopeSummary.length ? (
                    scopeSummary.map((scope, index) => (
                      <Badge key={`${scope}-${index}`} variant="outline" className="font-normal">{scope}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 align-middle">
                <div className="flex items-center gap-2">
                  <div className={cn("size-2 rounded-full ring-2 ring-background", user.status === "ACTIVE" ? "bg-emerald-500" : "bg-muted-foreground")} />
                  <span className="text-sm capitalize text-muted-foreground">{user.status.toLowerCase()}</span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 align-middle whitespace-nowrap text-sm text-muted-foreground">
                {user.lastLoginAt
                  ? new Intl.DateTimeFormat("en-SA", {
                      dateStyle: "medium",
                    }).format(new Date(user.lastLoginAt))
                  : "Never"}
              </TableCell>
              <TableCell className="px-4 py-3 align-middle text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button nativeButton={false} render={<Link href={`/portal/admin/users/${user.id}`} />} size="icon-sm" variant="ghost">
                    <Eye />
                    <span className="sr-only">Open details</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="group/button inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] text-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                      <MoreHorizontal />
                      <span className="sr-only">User actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <Link className="flex w-full items-center" href={`/portal/admin/users/${user.id}`}>
                          Open details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-1 py-1">
                        {user.status === "ACTIVE" ? (
                          <PortalConfirmAction
                            action={deactivatePortalUserAction}
                            description="Deactivated users keep their governed history but lose operational access until reactivated."
                            fields={{ userId: user.id }}
                            title="Deactivate this user?"
                            triggerLabel="Deactivate"
                            triggerVariant="ghost"
                            className="w-full justify-start"
                          />
                        ) : (
                          <PortalConfirmAction
                            action={activatePortalUserAction}
                            description="Activating this user restores portal access according to their active assignments."
                            fields={{ userId: user.id }}
                            title="Activate this user?"
                            triggerLabel="Activate"
                            triggerVariant="ghost"
                            className="w-full justify-start"
                          />
                        )}
                        <PortalConfirmAction
                          action={deletePortalUserAction}
                          confirmVariant="destructive"
                          description="Delete is only allowed when the user is not referenced by governed operational records. If protected records exist, the backend will stop this action."
                          fields={{ userId: user.id }}
                          title="Delete this user?"
                          triggerLabel="Delete"
                          triggerVariant="ghost"
                          className="mt-1 w-full justify-start text-destructive hover:text-destructive"
                        />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </div>
  );
}
