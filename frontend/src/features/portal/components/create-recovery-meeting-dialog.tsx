"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecoveryMeetingEditor } from "./recovery-meeting-editor";
import { createPortalRecoveryMeetingFormAction } from "@/features/portal/lib/mutations";
import type { PortalArea, PortalRegion } from "@/features/portal/lib/api";

interface CreateRecoveryMeetingDialogProps {
  regions: PortalRegion[];
  areas: PortalArea[];
}

export function CreateRecoveryMeetingDialog({
  regions,
  areas,
}: CreateRecoveryMeetingDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shadow-sm" />}>
        <Plus className="mr-2 size-4" />
        Add Meeting
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create recovery meeting</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RecoveryMeetingEditor
            action={createPortalRecoveryMeetingFormAction}
            regions={regions}
            areas={areas}
            title=""
            description="Use the structured form below to save a clean draft. Operators can publish once the public-facing details are ready."
            submitLabel="Save as draft"
            successMessage="Recovery meeting created successfully."
            onCancel={() => setOpen(false)}
            compact
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
