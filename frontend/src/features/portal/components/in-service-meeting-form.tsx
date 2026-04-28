import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlannedActivitiesField } from "@/features/portal/components/planned-activities-field";
import type { PortalCommittee, PortalInServiceMeeting } from "@/features/portal/lib/api";

export type InServiceMeetingFormat = "PHYSICAL" | "ZOOM";

interface InServiceMeetingFormProps {
  action: (formData: FormData) => void | Promise<void>;
  committees: PortalCommittee[];
  format: InServiceMeetingFormat;
  meeting?: PortalInServiceMeeting;
  submitLabel: string;
}

const formatCopy = {
  PHYSICAL: {
    venueName: "Venue name",
    venuePlaceholder: "Committee room, office, or service venue",
    city: "City",
    district: "District",
    address: "Address",
    addressPlaceholder: "Readable location details for attendees",
  },
  ZOOM: {
    zoomJoinUrl: "Zoom join URL",
    zoomJoinUrlPlaceholder: "https://zoom.us/j/...",
    zoomMeetingId: "Zoom meeting ID",
    zoomPasscode: "Passcode",
  },
} as const;

export function InServiceMeetingForm({
  action,
  committees,
  format,
  meeting,
  submitLabel,
}: InServiceMeetingFormProps) {
  return (
    <form action={action} className="grid gap-5 xl:grid-cols-2">
      {meeting ? <input name="meetingId" type="hidden" value={meeting.id} /> : null}
      <input name="meetingFormat" type="hidden" value={format} />

      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
        Committee
        <select
          name="committeeId"
          className="h-12 rounded-xl border border-border/50 bg-white px-4 text-sm text-foreground shadow-sm"
          defaultValue={meeting?.committeeId ?? ""}
          required
        >
          <option disabled value="">
            Select committee
          </option>
          {committees.map((committee) => (
            <option key={committee.id} value={committee.id}>
              {committee.nameEn}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
        Meeting date
        <Input
          name="meetingDate"
          type="date"
          defaultValue={meeting?.meetingDate.slice(0, 10) ?? ""}
          required
        />
      </label>

      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
        Title (English)
        <Input name="titleEn" defaultValue={meeting?.titleEn ?? ""} required />
      </label>

      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
        Title (Arabic)
        <Input name="titleAr" defaultValue={meeting?.titleAr ?? ""} required />
      </label>

      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
        Start time
        <Input name="startTime" type="time" defaultValue={meeting?.startTime ?? ""} required />
      </label>

      <label className="grid gap-2 text-xs font-medium text-muted-foreground">
        End time
        <Input name="endTime" type="time" defaultValue={meeting?.endTime ?? ""} />
      </label>

      {format === "PHYSICAL" ? (
        <>
          <label className="grid gap-2 text-xs font-medium text-muted-foreground">
            {formatCopy.PHYSICAL.venueName}
            <Input
              name="venueName"
              defaultValue={meeting?.venueName ?? ""}
              placeholder={formatCopy.PHYSICAL.venuePlaceholder}
              required
            />
          </label>
          <label className="grid gap-2 text-xs font-medium text-muted-foreground">
            {formatCopy.PHYSICAL.city}
            <Input name="city" defaultValue={meeting?.city ?? ""} required />
          </label>
          <label className="grid gap-2 text-xs font-medium text-muted-foreground">
            {formatCopy.PHYSICAL.district}
            <Input name="district" defaultValue={meeting?.district ?? ""} />
          </label>
          <label className="grid gap-2 text-xs font-medium text-muted-foreground xl:col-span-2">
            {formatCopy.PHYSICAL.address}
            <Textarea
              name="address"
              defaultValue={meeting?.address ?? ""}
              placeholder={formatCopy.PHYSICAL.addressPlaceholder}
              required
            />
          </label>
        </>
      ) : (
        <>
          <label className="grid gap-2 text-xs font-medium text-muted-foreground xl:col-span-2">
            {formatCopy.ZOOM.zoomJoinUrl}
            <Input
              name="zoomJoinUrl"
              defaultValue={meeting?.zoomJoinUrl ?? ""}
              placeholder={formatCopy.ZOOM.zoomJoinUrlPlaceholder}
              type="url"
              required
            />
          </label>
          <label className="grid gap-2 text-xs font-medium text-muted-foreground">
            {formatCopy.ZOOM.zoomMeetingId}
            <Input name="zoomMeetingId" defaultValue={meeting?.zoomMeetingId ?? ""} required />
          </label>
          <label className="grid gap-2 text-xs font-medium text-muted-foreground">
            {formatCopy.ZOOM.zoomPasscode}
            <Input name="zoomPasscode" defaultValue={meeting?.zoomPasscode ?? ""} />
          </label>
        </>
      )}

      <label className="grid gap-2 text-xs font-medium text-muted-foreground xl:col-span-2">
        Short description
        <Textarea
          name="description"
          defaultValue={meeting?.description ?? ""}
          placeholder="Brief context for the meeting"
        />
      </label>

      <label className="grid gap-2 text-xs font-medium text-muted-foreground xl:col-span-2">
        Minutes of meeting
        <Textarea
          name="mom"
          defaultValue={meeting?.mom ?? ""}
          placeholder="Detailed minutes..."
          required
        />
      </label>

      <PlannedActivitiesField defaultValue={meeting?.plannedActivities} />

      <label className="grid gap-2 text-xs font-medium text-muted-foreground xl:col-span-2">
        Internal notes
        <Textarea
          name="notes"
          defaultValue={meeting?.notes ?? ""}
          placeholder="Private internal notes"
        />
      </label>

      <div className="xl:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
