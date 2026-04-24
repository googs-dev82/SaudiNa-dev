"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { createPortalAreaAction } from "@/features/portal/lib/mutations";
import type { PortalRegion } from "@/features/portal/lib/api";
import { reportPortalActionError } from "@/features/portal/lib/error";

interface CreateAreaDialogProps {
  regions: PortalRegion[];
  defaultRegionId?: string;
  lockRegion?: boolean;
  triggerLabel?: string;
}

export function CreateAreaDialog({
  regions,
  defaultRegionId,
  lockRegion = false,
  triggerLabel = "Create Area",
}: CreateAreaDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      await createPortalAreaAction(formData);
      setOpen(false);
    } catch (e) {
      reportPortalActionError(e, "Unable to create the area.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shadow-sm" />}>
        <Plus className="mr-2 size-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create area</DialogTitle>
          <DialogDescription>
            Attach the area to its parent region and keep bilingual naming aligned.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-4">
            {lockRegion && defaultRegionId ? (
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground">Parent Region</label>
                <input name="regionId" type="hidden" value={defaultRegionId} />
                <div className="h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                  {regions.find((region) => region.id === defaultRegionId)?.nameEn ?? "Selected region"}
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="regionId">Parent Region</label>
                <select
                  id="regionId"
                  name="regionId"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={defaultRegionId ?? ""}
                  disabled={isPending}
                  required
                >
                  <option disabled value="">Select region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>{region.nameEn}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="code">Area code</label>
              <Input disabled={isPending} id="code" name="code" placeholder="Area code" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="nameEn">Name (English)</label>
              <Input disabled={isPending} id="nameEn" name="nameEn" placeholder="Name (English)" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="nameAr">Name (Arabic)</label>
              <Input disabled={isPending} dir="rtl" id="nameAr" name="nameAr" placeholder="Name (Arabic)" required />
            </div>
            <div className="grid gap-2 mt-2">
              <label className="flex items-center gap-3 text-sm text-foreground">
                <input defaultChecked disabled={isPending} name="isActive" type="checkbox" className="accent-primary" />
                Area is active
              </label>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button disabled={isPending} type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
