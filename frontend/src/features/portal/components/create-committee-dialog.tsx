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
import { createPortalCommitteeAction } from "@/features/portal/lib/mutations";
import type { PortalArea, PortalRegion } from "@/features/portal/lib/api";
import { reportPortalActionError } from "@/features/portal/lib/error";

const committeeLevels = ["REGIONAL", "AREA"] as const;

interface CreateCommitteeDialogProps {
  regions: PortalRegion[];
  areas: PortalArea[];
  defaultLevel?: (typeof committeeLevels)[number];
  defaultRegionId?: string;
  defaultAreaId?: string;
  lockScope?: boolean;
  triggerLabel?: string;
}

export function CreateCommitteeDialog({
  regions,
  areas,
  defaultLevel,
  defaultRegionId,
  defaultAreaId,
  lockScope = false,
  triggerLabel = "Create Committee",
}: CreateCommitteeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  type CommitteeLevel = (typeof committeeLevels)[number];

  const [level, setLevel] = useState<CommitteeLevel>(
    defaultLevel ?? (defaultAreaId ? "AREA" : "AREA"),
  );

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      await createPortalCommitteeAction(formData);
      setOpen(false);
    } catch (e) {
      reportPortalActionError(e, "Unable to create the committee.");
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
          <DialogTitle>Create committee</DialogTitle>
          <DialogDescription>
            Choose the level first, then link the correct region and optional area parent.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-4">
            {lockScope ? (
              <>
                <input name="level" type="hidden" value={level} />
                <input name="regionId" type="hidden" value={defaultRegionId ?? ""} />
                <input name="areaId" type="hidden" value={level === "AREA" ? defaultAreaId ?? "" : ""} />
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Level</label>
                  <div className="h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">{level}</div>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Region</label>
                  <div className="h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                    {regions.find((region) => region.id === defaultRegionId)?.nameEn ?? "Selected region"}
                  </div>
                </div>
                {level === "AREA" ? (
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-muted-foreground">Area</label>
                    <div className="h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                      {areas.find((area) => area.id === defaultAreaId)?.nameEn ?? "Selected area"}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="level">Level</label>
                  <select
                    id="level"
                    name="level"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CommitteeLevel)}
                    disabled={isPending}
                  >
                    {committeeLevels.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="regionId">Region</label>
                  <select
                    id="regionId"
                    name="regionId"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
                {level === "AREA" && (
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="areaId">Area (Optional)</label>
                    <select
                      id="areaId"
                      name="areaId"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      defaultValue={defaultAreaId ?? ""}
                      disabled={isPending}
                    >
                      <option value="">No area</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>{area.nameEn}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="code">Committee code</label>
              <Input disabled={isPending} id="code" name="code" placeholder="Committee code" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="nameEn">Name (English)</label>
              <Input disabled={isPending} id="nameEn" name="nameEn" placeholder="Name (English)" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="nameAr">Name (Arabic)</label>
              <Input disabled={isPending} dir="rtl" id="nameAr" name="nameAr" placeholder="Name (Arabic)" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="descriptionEn">Description (English)</label>
              <Input disabled={isPending} id="descriptionEn" name="descriptionEn" placeholder="Description (English)" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="descriptionAr">Description (Arabic)</label>
              <Input disabled={isPending} dir="rtl" id="descriptionAr" name="descriptionAr" placeholder="Description (Arabic)" />
            </div>
            <div className="grid gap-2 mt-2">
              <label className="flex items-center gap-3 text-sm text-foreground">
                <input defaultChecked disabled={isPending} name="isActive" type="checkbox" className="accent-primary" />
                Committee is active
              </label>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button disabled={isPending} type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create committee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
