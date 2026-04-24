"use client";

import { useState } from "react";
import { FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ResourceUploadForm } from "./resource-upload-form";
import type { PortalResourceCategory } from "@/features/portal/lib/api";

interface UploadResourceDialogProps {
  categories: PortalResourceCategory[];
}

export function UploadResourceDialog({ categories }: UploadResourceDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shadow-sm" />}>
        <FilePlus className="mr-2 size-4" />
        Upload Resource
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload governed resource</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ResourceUploadForm categories={categories} onCancel={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
