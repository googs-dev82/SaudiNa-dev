"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PortalArea, PortalRecoveryMeeting, PortalRegion } from "@/features/portal/lib/api";
import { createPortalRecoveryMeetingFormAction, updatePortalRecoveryMeetingFormAction } from "@/features/portal/lib/mutations";
import { RecoveryMeetingEditor } from "./recovery-meeting-editor";

interface RecoveryMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regions: PortalRegion[];
  areas: PortalArea[];
  locale: "ar" | "en";
  meeting?: PortalRecoveryMeeting | null;
}

export function RecoveryMeetingDialog({
  open,
  onOpenChange,
  regions,
  areas,
  locale,
  meeting,
}: RecoveryMeetingDialogProps) {
  const isEditing = Boolean(meeting);
  const title =
    locale === "ar"
      ? isEditing
        ? "تعديل اجتماع التعافي"
        : "إنشاء اجتماع تعافٍ"
      : isEditing
        ? "Edit recovery meeting"
        : "Create recovery meeting";
  const description =
    locale === "ar"
      ? isEditing
        ? "حدّث بيانات الاجتماع من خلال النموذج المنسق نفسه الذي تستخدمه البوابة."
        : "Use the structured form to create a clean meeting draft that matches the portal workflow."
      : isEditing
        ? "Update the meeting using the same structured form the portal uses everywhere else."
        : "Use the structured form to create a clean meeting draft that matches the portal workflow.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>
        <div className="py-4">
          <RecoveryMeetingEditor
            action={isEditing ? updatePortalRecoveryMeetingFormAction : createPortalRecoveryMeetingFormAction}
            areas={areas}
            compact
            locale={locale}
            meeting={meeting ?? undefined}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => onOpenChange(false)}
            regions={regions}
            submitLabel={locale === "ar" ? (isEditing ? "حفظ التعديل" : "حفظ المسودة") : (isEditing ? "Save changes" : "Save draft")}
            successMessage={
              locale === "ar"
                ? isEditing
                  ? "تم تحديث اجتماع التعافي بنجاح."
                  : "تم إنشاء اجتماع التعافي بنجاح."
                : isEditing
                  ? "Recovery meeting updated successfully."
                  : "Recovery meeting created successfully."
            }
            title=""
            description=""
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
