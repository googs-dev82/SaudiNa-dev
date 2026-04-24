"use client";

import { Search, Download, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRoleLabel } from "@/features/portal/lib/governance";
import { CreateUserDialog } from "./create-user-dialog";

import type { PortalArea, PortalCommittee, PortalRegion } from "@/features/portal/lib/api";

interface UsersFiltersProps {
  defaultQuery: string;
  defaultStatus: string;
  defaultRole: string;
  roleOptions: string[];
  regions: PortalRegion[];
  areas: PortalArea[];
  committees: PortalCommittee[];
}

export function UsersFilters({
  defaultQuery,
  defaultStatus,
  defaultRole,
  roleOptions,
  regions,
  areas,
  committees,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center" id="users-filter-form">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input 
            className="bg-white pl-9 shadow-sm" 
            defaultValue={defaultQuery} 
            name="q" 
            placeholder="Search users..." 
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="flex h-10 w-[140px] items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={defaultStatus}
            name="status"
            onChange={(e) => e.target.form?.submit()}
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <select
            className="flex h-10 w-[160px] items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={defaultRole}
            name="role"
            onChange={(e) => e.target.form?.submit()}
          >
            <option value="ALL">All roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {formatRoleLabel(role)}
              </option>
            ))}
          </select>
        </div>
      </form>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="bg-white shadow-sm">
          <Download className="mr-2 size-4" />
          Export
        </Button>
        <CreateUserDialog
          regions={regions}
          areas={areas}
          committees={committees}
        />
      </div>
    </div>
  );
}
