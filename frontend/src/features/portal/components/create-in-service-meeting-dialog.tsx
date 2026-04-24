"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlannedActivitiesField } from "./planned-activities-field";
import { createPortalInServiceMeetingAction } from "@/features/portal/lib/mutations";
import type { PortalCommittee } from "@/features/portal/lib/api";
import { reportPortalActionError } from "@/features/portal/lib/error";

interface CreateInServiceMeetingDialogProps {
  committees: PortalCommittee[];
}

export function CreateInServiceMeetingDialog({
  committees,
}: CreateInServiceMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      await createPortalInServiceMeetingAction(formData);
      setOpen(false);
    } catch (e) {
      reportPortalActionError(e, "Unable to create the meeting.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shadow-sm" />}>
        <Plus className="mr-2 size-4" />
        New Meeting
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New committee meeting</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="committeeId">
                Committee
              </label>
              <select
                id="committeeId"
                name="committeeId"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                defaultValue=""
                disabled={isPending}
                required
              >
                <option disabled value="">
                  Select committee
                </option>
                {committees.map((committee) => (
                  <option key={committee.id} value={committee.id}>
                    {committee.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="meetingDate">
                Meeting Date
              </label>
              <Input disabled={isPending} id="meetingDate" name="meetingDate" type="date" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="titleEn">
                Title (English)
              </label>
              <Input disabled={isPending} id="titleEn" name="titleEn" placeholder="Title (English)" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="titleAr">
                Title (Arabic)
              </label>
              <Input disabled={isPending} id="titleAr" name="titleAr" placeholder="Title (Arabic)" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="startTime">
                Start Time
              </label>
              <Input disabled={isPending} id="startTime" name="startTime" type="time" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="endTime">
                End Time
              </label>
              <Input disabled={isPending} id="endTime" name="endTime" type="time" />
            </div>
            
            <div className="grid gap-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="description">
                Short Description
              </label>
              <Textarea disabled={isPending} id="description" name="description" placeholder="Brief context for the meeting" />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="mom">
                Minutes of Meeting
              </label>
              <Textarea disabled={isPending} id="mom" name="mom" placeholder="Detailed minutes..." required />
            </div>

            <div className="md:col-span-2">
              <PlannedActivitiesField />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="notes">
                Internal Notes
              </label>
              <Textarea disabled={isPending} id="notes" name="notes" placeholder="Private internal notes" />
            </div>
          </div>

          <DialogFooter>
            <Button disabled={isPending} type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
