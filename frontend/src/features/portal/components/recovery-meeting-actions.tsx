"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PortalConfirmAction } from "./portal-confirm-action";
import { RecoveryMeetingDialog } from "./recovery-meeting-dialog";
import type { PortalArea, PortalRecoveryMeeting, PortalRegion } from "@/features/portal/lib/api";
import {
  archiveRecoveryMeetingAction,
  deleteRecoveryMeetingAction,
} from "@/features/portal/lib/mutations";

interface RecoveryMeetingActionsProps {
  meeting: PortalRecoveryMeeting;
  regions: PortalRegion[];
  areas: PortalArea[];
  locale: "ar" | "en";
}

export function RecoveryMeetingActions({
  meeting,
  regions,
  areas,
  locale,
}: RecoveryMeetingActionsProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <RecoveryMeetingDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        regions={regions}
        areas={areas}
        locale={locale}
        meeting={meeting}
      />

      <div className="flex items-center justify-end gap-2">
        <Button asChild size="icon-sm" variant="ghost">
          <Link href={`/portal/meetings/recovery/${meeting.id}`}>
            <span className="sr-only">{locale === "ar" ? "عرض التفاصيل" : "View details"}</span>
            <span aria-hidden>↗</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="group/button inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] text-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
            <MoreHorizontal />
            <span className="sr-only">{locale === "ar" ? "إجراءات الاجتماع" : "Meeting actions"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem>
              <Link className="flex w-full items-center" href={`/portal/meetings/recovery/${meeting.id}`}>
                {locale === "ar" ? "عرض التفاصيل" : "View details"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setEditOpen(true); }}>
              {locale === "ar" ? "تعديل" : "Edit"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-1 py-1">
              {meeting.status !== "ARCHIVED" ? (
                <PortalConfirmAction
                  action={archiveRecoveryMeetingAction}
                  className="w-full justify-start"
                  description={locale === "ar" ? "يؤدي التعطيل إلى إخراج الاجتماع من الاستخدام التشغيلي النشط." : "Disabling retires this meeting from active operational use."}
                  fields={{ meetingId: meeting.id }}
                  title={locale === "ar" ? "تعطيل اجتماع التعافي؟" : "Disable recovery meeting?"}
                  triggerLabel={locale === "ar" ? "تعطيل" : "Disable"}
                  triggerVariant="ghost"
                />
              ) : null}
              <PortalConfirmAction
                action={deleteRecoveryMeetingAction}
                className="mt-1 w-full justify-start text-destructive hover:text-destructive"
                confirmVariant="destructive"
                description={locale === "ar" ? "الحذف نهائي وسيزيل السجل من قاعدة البيانات عندما تسمح القيود بذلك." : "Delete is permanent and removes the record from the database when constraints allow it."}
                fields={{ meetingId: meeting.id }}
                title={locale === "ar" ? "حذف اجتماع التعافي؟" : "Delete recovery meeting?"}
                triggerLabel={locale === "ar" ? "حذف" : "Delete"}
                triggerVariant="ghost"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
