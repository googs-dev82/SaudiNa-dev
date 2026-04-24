"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import {
  cancelPortalEventAction,
  publishPortalEventAction,
  unpublishPortalEventAction,
} from "@/features/portal/lib/mutations";
import type { Locale } from "@/config/site";

export function EventRowActions({
  eventId,
  status,
  visibility,
  detailHref,
  editHref,
  showAuditAction = false,
  locale = "en",
}: {
  eventId: string;
  status: string;
  visibility: string;
  detailHref: string;
  editHref: string;
  showAuditAction?: boolean;
  locale?: Locale;
}) {
  const router = useRouter();
  const canPublish = visibility === "PUBLIC" && status === "CONFIRMED";
  const canUnpublish = visibility === "PUBLIC" && status === "PUBLISHED";
  const canCancel = status !== "CANCELLED";
  const copy =
    locale === "ar"
      ? {
          view: "عرض",
          more: "المزيد",
          details: "عرض التفاصيل",
          edit: "تعديل الفعالية",
          audit: "سجل التدقيق",
          publishTitle: "نشر الفعالية؟",
          publishDesc: "سيجعل هذا الفعالية العامة المؤكدة مرئية في صفحة الفعاليات.",
          publish: "نشر",
          unpublishTitle: "إلغاء نشر الفعالية؟",
          unpublishDesc: "سيؤدي هذا إلى إزالة الفعالية من صفحة الفعاليات العامة.",
          unpublish: "إلغاء النشر",
          cancelTitle: "إلغاء الفعالية؟",
          cancelDesc: "سيؤدي الإلغاء إلى إيقاف السجل الحالي وإزالته من التوفر العام إذا كانت منشورة.",
          cancel: "إلغاء",
          reason: "سبب الإلغاء",
        }
      : {
          view: "View",
          more: "More",
          details: "View details",
          edit: "Edit event",
          audit: "Audit log",
          publishTitle: "Publish event?",
          publishDesc: "Publishing will make this confirmed public event visible on the website Events page.",
          publish: "Publish",
          unpublishTitle: "Unpublish event?",
          unpublishDesc: "This will remove the event from the public Events page.",
          unpublish: "Unpublish",
          cancelTitle: "Cancel event?",
          cancelDesc: "Cancelling will stop the current event record and remove it from public availability if published.",
          cancel: "Cancel",
          reason: "Cancellation reason",
        };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={detailHref}>{copy.view}</Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open event actions"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-border/60 bg-background px-3 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/20"
          type="button"
        >
          <MoreHorizontalIcon data-icon="inline-start" />
          {copy.more}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(detailHref)}>{copy.details}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(editHref)}>{copy.edit}</DropdownMenuItem>
          {showAuditAction ? (
            <DropdownMenuItem onClick={() => router.push(detailHref)}>{copy.audit}</DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {canPublish ? (
        <PortalConfirmAction
          title={copy.publishTitle}
          description={copy.publishDesc}
          triggerLabel={copy.publish}
          action={publishPortalEventAction}
          fields={{ eventId }}
          className="h-9 px-3 text-xs"
        />
      ) : null}

      {canUnpublish ? (
        <PortalConfirmAction
          title={copy.unpublishTitle}
          description={copy.unpublishDesc}
          triggerLabel={copy.unpublish}
          action={unpublishPortalEventAction}
          fields={{ eventId }}
          triggerVariant="outline"
          confirmVariant="destructive"
          className="h-9 px-3 text-xs"
        />
      ) : null}

      {canCancel ? (
        <PortalConfirmAction
          title={copy.cancelTitle}
          description={copy.cancelDesc}
          triggerLabel={copy.cancel}
          action={cancelPortalEventAction}
          fields={{ eventId }}
          triggerVariant="destructive"
          confirmVariant="destructive"
          className="h-9 px-3 text-xs"
        >
          <Textarea name="reason" placeholder={copy.reason} />
        </PortalConfirmAction>
      ) : null}
    </div>
  );
}
