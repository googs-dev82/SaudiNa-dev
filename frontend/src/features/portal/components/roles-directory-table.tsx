"use client";

import Link from "next/link";
import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { roleDefinitions } from "@/features/portal/lib/governance";

export function RolesDirectoryTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(roleDefinitions.map((r) => r.code));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (code: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, code]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== code));
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const selectedEntries = selectedIds.length > 0 
      ? roleDefinitions.filter((r) => selectedIds.includes(r.code))
      : roleDefinitions;

    const tableData = selectedEntries.map((r) => [
      r.label,
      r.code,
      r.scopeType,
      r.description,
      r.governanceNote,
    ]);

    doc.text(selectedIds.length > 0 ? "SaudiNA - Selected Roles Export" : "SaudiNA - All Roles Export", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Code", "Scope Type", "Description", "Governance Note"]],
      body: tableData,
    });

    doc.save("roles-export.pdf");
  };

  const isAllSelected = roleDefinitions.length > 0 && selectedIds.length === roleDefinitions.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2.5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          {selectedIds.length > 0 
            ? `${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"} selected`
            : "No items selected (Export will include all roles)"
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
              <TableHead className="px-4 font-medium text-muted-foreground">Role</TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">Code</TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">Scope Type</TableHead>
              <TableHead className="px-4 font-medium text-muted-foreground">Description</TableHead>
              <TableHead className="px-4 text-right font-medium text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roleDefinitions.map((role) => (
              <TableRow key={role.code} className="group hover:bg-muted/50 data-[state=selected]:bg-muted">
                <TableCell className="px-4 py-3 align-middle">
                  <input
                    type="checkbox"
                    aria-label="Select role"
                    className="size-4 rounded border-muted-foreground/30 text-primary accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    checked={selectedIds.includes(role.code)}
                    onChange={(e) => handleSelectOne(role.code, e.target.checked)}
                  />
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <span className="font-medium text-primary">{role.label}</span>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <Badge variant="outline" className="font-mono text-[10px] py-0">
                    {role.code}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <Badge variant="secondary" className="text-[10px] py-0">
                    {role.scopeType}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <div className="flex flex-col gap-1 max-w-[400px]">
                    <span className="text-sm text-muted-foreground line-clamp-2">{role.description}</span>
                    <span className="text-[10px] text-muted-foreground/60 italic">{role.governanceNote}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-right">
                  <Button
                    nativeButton={false}
                    render={<Link href={`/portal/admin/roles/${role.code}`} />}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Eye className="size-4" />
                    <span className="sr-only">Open details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
