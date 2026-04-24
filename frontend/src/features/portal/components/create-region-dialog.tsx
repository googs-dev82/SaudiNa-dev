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
import { createPortalRegionAction } from "@/features/portal/lib/mutations";
import { reportPortalActionError } from "@/features/portal/lib/error";

export function CreateRegionDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      await createPortalRegionAction(formData);
      setOpen(false);
    } catch (e) {
      reportPortalActionError(e, "Unable to create the region.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shadow-sm" />}>
        <Plus className="mr-2 size-4" />
        Create Region
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create region</DialogTitle>
          <DialogDescription>
            Create a clean regional record with bilingual naming and activation state.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="code">Region code</label>
              <Input disabled={isPending} id="code" name="code" placeholder="Region code" required />
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
                Region is active
              </label>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button disabled={isPending} type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create region"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
