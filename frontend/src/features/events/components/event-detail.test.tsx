import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventDetail } from "./event-detail";

describe("EventDetail", () => {
  it("renders admin governance panels for creator, booking, notifications, and restrictions", () => {
    render(
      <EventDetail
        locale="en"
        backHref="/portal/admin/events"
        backLabel="Back to governance register"
        isAdmin
        event={
          {
            id: "evt-1",
            title: "Leadership Forum",
            description: "Quarterly forum",
            visibility: "PRIVATE",
            mode: "HYBRID",
            status: "TENTATIVE",
            date: "2026-04-12T00:00:00.000Z",
            startTime: "18:00",
            endTime: "20:00",
            timezone: "Asia/Riyadh",
            zoomEnabled: true,
            regionId: "region-1",
            areaId: "area-1",
            regions: {
              id: "region-1",
              code: "R1",
              nameAr: "المنطقة 1",
              nameEn: "Region 1",
            },
            areas: {
              id: "area-1",
              regionId: "region-1",
              code: "A1",
              nameAr: "الحي 1",
              nameEn: "Area 1",
            },
            creator: {
              id: "user-1",
              email: "creator@saudina.local",
              displayName: "Event Creator",
              status: "ACTIVE",
            },
            organizerName: "Event Creator",
            publicationStatus: {
              status: "UNPUBLISHED",
            },
            bookingRequests: [
              {
                id: "br-1",
                eventId: "evt-1",
                requestedById: "user-1",
                requestedStartAt: "2026-04-12T18:00:00.000Z",
                requestedEndAt: "2026-04-12T20:00:00.000Z",
                timezone: "Asia/Riyadh",
                status: "TENTATIVE",
                idempotencyKey: "idem-1",
                tentativeHolds: [
                  {
                    id: "hold-1",
                    eventId: "evt-1",
                    bookingRequestId: "br-1",
                    slotId: "slot-1",
                    holdToken: "idem-1",
                    expiresAt: "2026-04-12T12:30:00.000Z",
                    status: "ACTIVE",
                    createdAt: "2026-04-12T12:00:00.000Z",
                    updatedAt: "2026-04-12T12:00:00.000Z",
                  },
                ],
                zoomMeetings: [
                  {
                    id: "zoom-1",
                    eventId: "evt-1",
                    bookingRequestId: "br-1",
                    zoomMeetingId: "987654321",
                    joinUrl: "https://zoom.us/j/987654321",
                    externalStatus: "created",
                    idempotencyKey: "idem-1",
                    bookedAt: "2026-04-12T12:05:00.000Z",
                  },
                ],
              },
            ],
            notificationLogs: [
              {
                id: "notif-1",
                eventId: "evt-1",
                bookingRequestId: "br-1",
                notificationType: "BOOKING_CONFIRMATION",
                recipientEmail: "creator@saudina.local",
                status: "SENT",
                sentAt: "2026-04-12T12:06:00.000Z",
                createdAt: "2026-04-12T12:06:00.000Z",
              },
            ],
            auditLogs: [
              {
                id: "audit-1",
                eventId: "evt-1",
                action: "CREATED",
                createdAt: "2026-04-12T12:00:00.000Z",
              },
            ],
          } as never
        }
        auditLogs={[
          {
            id: "audit-1",
            eventId: "evt-1",
            action: "CREATED",
            createdAt: "2026-04-12T12:00:00.000Z",
          },
        ] as never}
      />,
    );

    expect(screen.getAllByText("Event Creator").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Private").length).toBeGreaterThan(0);
    expect(screen.getByText("987654321")).toBeInTheDocument();
    expect(screen.getByText("BOOKING_CONFIRMATION")).toBeInTheDocument();
    expect(screen.getByText("This event is private and is hidden from public pages, public search, and public chatbot answers.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to governance register" })).toBeInTheDocument();
  });
});
