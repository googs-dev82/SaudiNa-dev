"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { createPortalResourceCategoryAction } from "@/features/portal/lib/mutations";
import { reportPortalActionError } from "@/features/portal/lib/error";

export function CreateResourceCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      await createPortalResourceCategoryAction(formData);
      setOpen(false);
    } catch (e) {
      reportPortalActionError(e, "Unable to create the resource category.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="shadow-sm" />}>
        <FolderPlus className="mr-2 size-4" />
        New Category
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create resource category</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="code">Category code</label>
              <Input disabled={isPending} id="code" name="code" placeholder="e.g. CORE_DOCS" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="nameEn">Name (English)</label>
              <Input disabled={isPending} id="nameEn" name="nameEn" placeholder="Name (English)" required />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="nameAr">Name (Arabic)</label>
              <Input disabled={isPending} id="nameAr" name="nameAr" placeholder="Name (Arabic)" required />
            </div>
          </div>
          
          <DialogFooter>
            <Button disabled={isPending} type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
