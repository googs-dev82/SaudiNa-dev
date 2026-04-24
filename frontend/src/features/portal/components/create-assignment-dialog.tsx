"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AssignmentForm } from "@/features/portal/components/assignment-form";
import type {
  PortalAdminUser,
  PortalArea,
  PortalCommittee,
  PortalRegion,
} from "@/features/portal/lib/api";

interface CreateAssignmentDialogProps {
  users: PortalAdminUser[];
  regions: PortalRegion[];
  areas: PortalArea[];
  committees: PortalCommittee[];
  defaultScopeType?: "GLOBAL" | "REGION" | "AREA" | "COMMITTEE";
  defaultScopeId?: string;
  defaultScopeCode?: string;
  lockScope?: boolean;
  triggerLabel?: string;
}

export function CreateAssignmentDialog({
  users,
  regions,
  areas,
  committees,
  defaultScopeType,
  defaultScopeId,
  defaultScopeCode,
  lockScope = false,
  triggerLabel = "Create Assignment",
}: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shadow-sm" />}>
        <Plus className="mr-2 size-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create assignment</DialogTitle>
          <DialogDescription>
            Use governed selectors to avoid manual scope entry and keep the RBAC model clean.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AssignmentForm
            mode="create"
            users={users}
            regions={regions}
            areas={areas}
            committees={committees}
            lockedScopeType={lockScope ? defaultScopeType : undefined}
            lockedScopeId={lockScope ? defaultScopeId : undefined}
            lockedScopeCode={lockScope ? defaultScopeCode : undefined}
            onCancel={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
