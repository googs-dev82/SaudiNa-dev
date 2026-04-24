"use client";

import { Textarea } from "@/components/ui/textarea";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import {
  cancelPortalEventAction,
  publishPortalEventAction,
  unpublishPortalEventAction,
} from "@/features/portal/lib/mutations";
import type { Locale } from "@/config/site";

export function EventManagementActions({
  eventId,
  status,
  visibility,
  locale = "en",
}: {
  eventId: string;
  status: string;
  visibility: string;
  locale?: Locale;
}) {
  const copy =
    locale === "ar"
      ? {
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
    <div className="flex flex-wrap gap-3">
      {visibility === "PUBLIC" && status === "CONFIRMED" ? (
        <PortalConfirmAction
          title={copy.publishTitle}
          description={copy.publishDesc}
          triggerLabel={copy.publish}
          action={publishPortalEventAction}
          fields={{ eventId }}
        />
      ) : null}

      {visibility === "PUBLIC" && status === "PUBLISHED" ? (
        <PortalConfirmAction
          title={copy.unpublishTitle}
          description={copy.unpublishDesc}
          triggerLabel={copy.unpublish}
          action={unpublishPortalEventAction}
          fields={{ eventId }}
          confirmVariant="destructive"
        />
      ) : null}

      {status !== "CANCELLED" ? (
        <PortalConfirmAction
          title={copy.cancelTitle}
          description={copy.cancelDesc}
          triggerLabel={copy.cancel}
          action={cancelPortalEventAction}
          fields={{ eventId }}
          triggerVariant="destructive"
          confirmVariant="destructive"
        >
          <Textarea name="reason" placeholder={copy.reason} />
        </PortalConfirmAction>
      ) : null}
    </div>
  );
}
