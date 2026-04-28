"use server";

import { revalidatePath } from "next/cache";
import { env } from "@/config/env";
import type { PortalActionState } from "./action-state";
import { getPortalToken } from "./session";

async function portalMutation<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body: Record<string, unknown>,
): Promise<T> {
  const token = await getPortalToken();

  if (!env.apiBaseUrl || !token) {
    throw new Error("Missing portal API configuration.");
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: method === "DELETE" ? undefined : JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    throw new Error("Unable to reach the backend API. Please try again.");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(payload?.message ?? "Backend mutation failed.");
  }

  return (await response.json()) as T;
}

async function asPortalActionState(
  action: () => Promise<void>,
): Promise<PortalActionState> {
  try {
    await action();
    return {
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your changes.",
      success: false,
    };
  }
}

const asOptionalString = (value: FormDataEntryValue | null) => {
  const trimmed = value?.toString().trim();
  return trimmed ? trimmed : undefined;
};

const asBoolean = (value: FormDataEntryValue | null) =>
  value?.toString() === "on";

const asNumber = (value: FormDataEntryValue | null) => {
  const text = value?.toString().trim();
  if (!text) return undefined;
  const number = Number(text);
  return Number.isFinite(number) ? number : undefined;
};

export async function createPortalUserAction(formData: FormData) {
  const user = await portalMutation<{ id: string }>("/api/v1/users", "POST", {
    email: formData.get("email")?.toString(),
    displayName: formData.get("displayName")?.toString(),
    provider: formData.get("provider")?.toString(),
  });

  if (formData.get("roleCode")) {
    await portalMutation("/api/v1/admin/assignments", "POST", {
      userId: user.id,
      roleCode: formData.get("roleCode")?.toString(),
      scopeType: formData.get("scopeType")?.toString(),
      scopeId: asOptionalString(formData.get("scopeId")),
      scopeCode: asOptionalString(formData.get("scopeCode")),
      activeFrom: asOptionalString(formData.get("activeFrom")),
      activeUntil: asOptionalString(formData.get("activeUntil")),
      active: asBoolean(formData.get("active")),
    });
  }

  revalidatePath("/portal/admin/users");
}

export async function updatePortalUserAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();

  if (!userId) {
    throw new Error("Missing user id.");
  }

  await portalMutation(`/api/v1/users/${userId}`, "PATCH", {
    displayName: formData.get("displayName")?.toString(),
    status: formData.get("status")?.toString(),
  });

  revalidatePath("/portal/admin/users");
}

export async function activatePortalUserAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();

  if (!userId) {
    throw new Error("Missing user id.");
  }

  await portalMutation(`/api/v1/users/${userId}`, "PATCH", {
    status: "ACTIVE",
  });

  revalidatePath("/portal/admin/users");
  revalidatePath(`/portal/admin/users/${userId}`);
}

export async function deactivatePortalUserAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();

  if (!userId) {
    throw new Error("Missing user id.");
  }

  await portalMutation(`/api/v1/users/${userId}`, "PATCH", {
    status: "INACTIVE",
  });

  revalidatePath("/portal/admin/users");
  revalidatePath(`/portal/admin/users/${userId}`);
}

export async function deletePortalUserAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();

  if (!userId) {
    throw new Error("Missing user id.");
  }

  await portalMutation(`/api/v1/users/${userId}`, "DELETE", {});

  revalidatePath("/portal/admin/users");
}

export async function createPortalAssignmentAction(formData: FormData) {
  await portalMutation("/api/v1/admin/assignments", "POST", {
    userId: formData.get("userId")?.toString(),
    roleCode: formData.get("roleCode")?.toString(),
    scopeType: formData.get("scopeType")?.toString(),
    scopeId: asOptionalString(formData.get("scopeId")),
    scopeCode: asOptionalString(formData.get("scopeCode")),
    activeFrom: asOptionalString(formData.get("activeFrom")),
    activeUntil: asOptionalString(formData.get("activeUntil")),
    active: asBoolean(formData.get("active")),
  });

  revalidatePath("/portal/admin/users");
}

export async function updatePortalAssignmentAction(formData: FormData) {
  const assignmentId = formData.get("assignmentId")?.toString();

  if (!assignmentId) {
    throw new Error("Missing assignment id.");
  }

  await portalMutation(`/api/v1/admin/assignments/${assignmentId}`, "PATCH", {
    userId: formData.get("userId")?.toString(),
    roleCode: formData.get("roleCode")?.toString(),
    scopeType: formData.get("scopeType")?.toString(),
    scopeId: asOptionalString(formData.get("scopeId")),
    scopeCode: asOptionalString(formData.get("scopeCode")),
    activeFrom: asOptionalString(formData.get("activeFrom")),
    activeUntil: asOptionalString(formData.get("activeUntil")),
    active: asBoolean(formData.get("active")),
  });

  revalidatePath("/portal/admin/users");
}

export async function createPortalRegionAction(formData: FormData) {
  await portalMutation("/api/v1/admin/regions", "POST", {
    code: formData.get("code")?.toString(),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
    isActive: asBoolean(formData.get("isActive")),
  });

  revalidatePath("/portal/admin/locations");
}

export async function createPortalAreaAction(formData: FormData) {
  await portalMutation("/api/v1/admin/areas", "POST", {
    regionId: formData.get("regionId")?.toString(),
    code: formData.get("code")?.toString(),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
    isActive: asBoolean(formData.get("isActive")),
  });

  revalidatePath("/portal/admin/locations");
}

export async function createPortalCommitteeAction(formData: FormData) {
  await portalMutation("/api/v1/admin/committees", "POST", {
    code: formData.get("code")?.toString(),
    level: formData.get("level")?.toString(),
    regionId: formData.get("regionId")?.toString(),
    areaId: asOptionalString(formData.get("areaId")),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
    descriptionAr: asOptionalString(formData.get("descriptionAr")),
    descriptionEn: asOptionalString(formData.get("descriptionEn")),
    isActive: asBoolean(formData.get("isActive")),
  });

  revalidatePath("/portal/admin/locations");
}

export async function updatePortalRegionAction(formData: FormData) {
  const regionId = formData.get("regionId")?.toString();

  if (!regionId) {
    throw new Error("Missing region id.");
  }

  await portalMutation(`/api/v1/admin/regions/${regionId}`, "PATCH", {
    code: formData.get("code")?.toString(),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
    isActive: asBoolean(formData.get("isActive")),
  });

  revalidatePath("/portal/admin/locations");
}

export async function updatePortalAreaAction(formData: FormData) {
  const areaId = formData.get("areaId")?.toString();

  if (!areaId) {
    throw new Error("Missing area id.");
  }

  await portalMutation(`/api/v1/admin/areas/${areaId}`, "PATCH", {
    regionId: formData.get("regionId")?.toString(),
    code: formData.get("code")?.toString(),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
    isActive: asBoolean(formData.get("isActive")),
  });

  revalidatePath("/portal/admin/locations");
}

export async function updatePortalCommitteeAction(formData: FormData) {
  const committeeId = formData.get("committeeId")?.toString();

  if (!committeeId) {
    throw new Error("Missing committee id.");
  }

  await portalMutation(`/api/v1/admin/committees/${committeeId}`, "PATCH", {
    code: formData.get("code")?.toString(),
    level: formData.get("level")?.toString(),
    regionId: formData.get("regionId")?.toString(),
    areaId: asOptionalString(formData.get("areaId")),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
    descriptionAr: asOptionalString(formData.get("descriptionAr")),
    descriptionEn: asOptionalString(formData.get("descriptionEn")),
    isActive: asBoolean(formData.get("isActive")),
  });

  revalidatePath("/portal/admin/locations");
}

export async function activatePortalRegionAction(formData: FormData) {
  const regionId = formData.get("regionId")?.toString();
  await portalMutation(`/api/v1/admin/regions/${regionId}`, "PATCH", { isActive: true });
  revalidatePath("/portal/admin/locations");
}

export async function deactivatePortalRegionAction(formData: FormData) {
  const regionId = formData.get("regionId")?.toString();
  await portalMutation(`/api/v1/admin/regions/${regionId}`, "PATCH", { isActive: false });
  revalidatePath("/portal/admin/locations");
}

export async function deletePortalRegionAction(formData: FormData) {
  const regionId = formData.get("regionId")?.toString();
  await portalMutation(`/api/v1/admin/regions/${regionId}`, "DELETE", {});
  revalidatePath("/portal/admin/locations");
}

export async function activatePortalAreaAction(formData: FormData) {
  const areaId = formData.get("areaId")?.toString();
  await portalMutation(`/api/v1/admin/areas/${areaId}`, "PATCH", { isActive: true });
  revalidatePath("/portal/admin/locations");
}

export async function deactivatePortalAreaAction(formData: FormData) {
  const areaId = formData.get("areaId")?.toString();
  await portalMutation(`/api/v1/admin/areas/${areaId}`, "PATCH", { isActive: false });
  revalidatePath("/portal/admin/locations");
}

export async function deletePortalAreaAction(formData: FormData) {
  const areaId = formData.get("areaId")?.toString();
  await portalMutation(`/api/v1/admin/areas/${areaId}`, "DELETE", {});
  revalidatePath("/portal/admin/locations");
}

export async function activatePortalCommitteeAction(formData: FormData) {
  const committeeId = formData.get("committeeId")?.toString();
  await portalMutation(`/api/v1/admin/committees/${committeeId}`, "PATCH", { isActive: true });
  revalidatePath("/portal/admin/committees");
}

export async function deactivatePortalCommitteeAction(formData: FormData) {
  const committeeId = formData.get("committeeId")?.toString();
  await portalMutation(`/api/v1/admin/committees/${committeeId}`, "PATCH", { isActive: false });
  revalidatePath("/portal/admin/committees");
}

export async function deletePortalCommitteeAction(formData: FormData) {
  const committeeId = formData.get("committeeId")?.toString();
  await portalMutation(`/api/v1/admin/committees/${committeeId}`, "DELETE", {});
  revalidatePath("/portal/admin/committees");
}

export async function createPortalEventFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await createPortalEventAction(formData);
  });
}

export async function updatePortalEventFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await updatePortalEventAction(formData);
  });
}

export async function setPortalEventVisibilityFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await setPortalEventVisibilityAction(formData);
  });
}

export async function publishPortalEventFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await publishPortalEventAction(formData);
  });
}

export async function unpublishPortalEventFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await unpublishPortalEventAction(formData);
  });
}

export async function cancelPortalEventFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await cancelPortalEventAction(formData);
  });
}

export async function reschedulePortalEventFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await reschedulePortalEventAction(formData);
  });
}

export async function createPortalEventAction(formData: FormData) {
  await portalMutation("/api/v1/events", "POST", {
    regionId: formData.get("regionId")?.toString(),
    areaId: formData.get("areaId")?.toString(),
    title: formData.get("title")?.toString(),
    description: asOptionalString(formData.get("description")),
    date: formData.get("date")?.toString(),
    startTime: formData.get("startTime")?.toString(),
    endTime: asOptionalString(formData.get("endTime")),
    durationMinutes: asNumber(formData.get("durationMinutes")),
    mode: formData.get("mode")?.toString(),
    visibility: formData.get("visibility")?.toString(),
    zoomEnabled: asBoolean(formData.get("zoomEnabled")),
    invitationInstructions: asOptionalString(formData.get("invitationInstructions")),
    timezone: asOptionalString(formData.get("timezone")),
    organizerName: asOptionalString(formData.get("organizerName")),
    organizerUserId: asOptionalString(formData.get("organizerUserId")),
    locationAddress: asOptionalString(formData.get("locationAddress")),
    latitude: asNumber(formData.get("latitude")),
    longitude: asNumber(formData.get("longitude")),
    meetingLink: asOptionalString(formData.get("meetingLink")),
  });

  revalidatePath("/portal/events");
  revalidatePath("/portal/admin/events");
}

export async function updatePortalEventAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString();

  if (!eventId) {
    throw new Error("Missing event id.");
  }

  await portalMutation(`/api/v1/events/${eventId}`, "PATCH", {
    regionId: formData.get("regionId")?.toString(),
    areaId: formData.get("areaId")?.toString(),
    title: formData.get("title")?.toString(),
    description: asOptionalString(formData.get("description")),
    date: formData.get("date")?.toString(),
    startTime: formData.get("startTime")?.toString(),
    endTime: asOptionalString(formData.get("endTime")),
    durationMinutes: asNumber(formData.get("durationMinutes")),
    mode: formData.get("mode")?.toString(),
    visibility: formData.get("visibility")?.toString(),
    zoomEnabled: asBoolean(formData.get("zoomEnabled")),
    invitationInstructions: asOptionalString(formData.get("invitationInstructions")),
    timezone: asOptionalString(formData.get("timezone")),
    organizerName: asOptionalString(formData.get("organizerName")),
    organizerUserId: asOptionalString(formData.get("organizerUserId")),
    locationAddress: asOptionalString(formData.get("locationAddress")),
    latitude: asNumber(formData.get("latitude")),
    longitude: asNumber(formData.get("longitude")),
    meetingLink: asOptionalString(formData.get("meetingLink")),
  });

  revalidatePath("/portal/events");
  revalidatePath(`/portal/events/${eventId}`);
  revalidatePath("/portal/admin/events");
}

export async function setPortalEventVisibilityAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString();
  if (!eventId) throw new Error("Missing event id.");

  await portalMutation(`/api/v1/events/${eventId}/visibility`, "PATCH", {
    visibility: formData.get("visibility")?.toString(),
  });

  revalidatePath("/portal/events");
  revalidatePath(`/portal/events/${eventId}`);
  revalidatePath("/portal/admin/events");
}

export async function publishPortalEventAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString();
  if (!eventId) throw new Error("Missing event id.");
  await portalMutation(`/api/v1/events/${eventId}/publish`, "POST", {});
  revalidatePath("/portal/events");
  revalidatePath(`/portal/events/${eventId}`);
  revalidatePath("/portal/admin/events");
}

export async function unpublishPortalEventAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString();
  if (!eventId) throw new Error("Missing event id.");
  await portalMutation(`/api/v1/events/${eventId}/unpublish`, "POST", {});
  revalidatePath("/portal/events");
  revalidatePath(`/portal/events/${eventId}`);
  revalidatePath("/portal/admin/events");
}

export async function cancelPortalEventAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString();
  if (!eventId) throw new Error("Missing event id.");
  await portalMutation(`/api/v1/events/${eventId}/cancel`, "POST", {
    reason: asOptionalString(formData.get("reason")),
  });
  revalidatePath("/portal/events");
  revalidatePath(`/portal/events/${eventId}`);
  revalidatePath("/portal/admin/events");
}

export async function reschedulePortalEventAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString();
  if (!eventId) throw new Error("Missing event id.");
  await portalMutation(`/api/v1/events/${eventId}/reschedule`, "POST", {
    requestedStartAt: formData.get("requestedStartAt")?.toString(),
    requestedEndAt: formData.get("requestedEndAt")?.toString(),
    timezone: asOptionalString(formData.get("timezone")),
    idempotencyKey: asOptionalString(formData.get("idempotencyKey")),
  });
  revalidatePath("/portal/events");
  revalidatePath(`/portal/events/${eventId}`);
  revalidatePath("/portal/admin/events");
}

export async function activatePortalAssignmentAction(formData: FormData) {
  const assignmentId = formData.get("assignmentId")?.toString();
  await portalMutation(`/api/v1/admin/assignments/${assignmentId}`, "PATCH", { active: true });
  revalidatePath("/portal/admin/assignments");
  revalidatePath("/portal/admin/users");
}

export async function deactivatePortalAssignmentAction(formData: FormData) {
  const assignmentId = formData.get("assignmentId")?.toString();
  await portalMutation(`/api/v1/admin/assignments/${assignmentId}`, "PATCH", { active: false });
  revalidatePath("/portal/admin/assignments");
  revalidatePath("/portal/admin/users");
}

export async function deletePortalAssignmentAction(formData: FormData) {
  const assignmentId = formData.get("assignmentId")?.toString();
  await portalMutation(`/api/v1/admin/assignments/${assignmentId}`, "DELETE", {});
  revalidatePath("/portal/admin/assignments");
  revalidatePath("/portal/admin/users");
}

export async function publishRecoveryMeetingAction(formData: FormData) {
  const meetingId = formData.get("meetingId")?.toString();

  if (!meetingId) {
    throw new Error("Missing meeting id.");
  }

  await portalMutation(`/api/v1/admin/meetings/recovery/${meetingId}/publish`, "POST", {});
  revalidatePath("/portal/meetings/recovery");
}

export async function unpublishRecoveryMeetingAction(formData: FormData) {
  const meetingId = formData.get("meetingId")?.toString();

  if (!meetingId) {
    throw new Error("Missing meeting id.");
  }

  await portalMutation(`/api/v1/admin/meetings/recovery/${meetingId}/unpublish`, "POST", {});
  revalidatePath("/portal/meetings/recovery");
}

export async function archiveRecoveryMeetingAction(formData: FormData) {
  const meetingId = formData.get("meetingId")?.toString();

  if (!meetingId) {
    throw new Error("Missing meeting id.");
  }

  await portalMutation(`/api/v1/admin/meetings/recovery/${meetingId}/archive`, "POST", {});
  revalidatePath("/portal/meetings/recovery");
}

export async function deleteRecoveryMeetingAction(formData: FormData) {
  const meetingId = formData.get("meetingId")?.toString();

  if (!meetingId) {
    throw new Error("Missing meeting id.");
  }

  await portalMutation(`/api/v1/admin/meetings/recovery/${meetingId}`, "DELETE", {});
  revalidatePath("/portal/meetings/recovery");
}

export async function createPortalRecoveryMeetingFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await createPortalRecoveryMeetingAction(formData);
  });
}

export async function updatePortalRecoveryMeetingFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await updatePortalRecoveryMeetingAction(formData);
  });
}

export async function publishRecoveryMeetingFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await publishRecoveryMeetingAction(formData);
  });
}

export async function unpublishRecoveryMeetingFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await unpublishRecoveryMeetingAction(formData);
  });
}

export async function archiveRecoveryMeetingFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await archiveRecoveryMeetingAction(formData);
  });
}

export async function deleteRecoveryMeetingFormAction(
  _previousState: PortalActionState,
  formData: FormData,
) {
  return asPortalActionState(async () => {
    await deleteRecoveryMeetingAction(formData);
  });
}

export async function createPortalRecoveryMeetingAction(formData: FormData) {
  await portalMutation("/api/v1/admin/meetings/recovery", "POST", {
    regionId: formData.get("regionId")?.toString(),
    areaId: formData.get("areaId")?.toString(),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
    descriptionAr: asOptionalString(formData.get("descriptionAr")),
    descriptionEn: asOptionalString(formData.get("descriptionEn")),
    language: formData.get("language")?.toString(),
    gender: formData.get("gender")?.toString(),
    city: formData.get("city")?.toString(),
    district: asOptionalString(formData.get("district")),
    dayOfWeek: formData.get("dayOfWeek")?.toString(),
    startTime: formData.get("startTime")?.toString(),
    endTime: asOptionalString(formData.get("endTime")),
    isOnline: asBoolean(formData.get("isOnline")),
    meetingLink: asOptionalString(formData.get("meetingLink")),
    latitude: asOptionalString(formData.get("latitude"))
      ? Number(formData.get("latitude")?.toString())
      : undefined,
    longitude: asOptionalString(formData.get("longitude"))
      ? Number(formData.get("longitude")?.toString())
      : undefined,
    addressAr: asOptionalString(formData.get("addressAr")),
    addressEn: asOptionalString(formData.get("addressEn")),
  });

  revalidatePath("/portal/meetings/recovery");
}

export async function updatePortalRecoveryMeetingAction(formData: FormData) {
  const meetingId = formData.get("meetingId")?.toString();

  if (!meetingId) {
    throw new Error("Missing meeting id.");
  }

  await portalMutation(`/api/v1/admin/meetings/recovery/${meetingId}`, "PATCH", {
    regionId: formData.get("regionId")?.toString(),
    areaId: formData.get("areaId")?.toString(),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
    descriptionAr: asOptionalString(formData.get("descriptionAr")),
    descriptionEn: asOptionalString(formData.get("descriptionEn")),
    language: formData.get("language")?.toString(),
    gender: formData.get("gender")?.toString(),
    city: formData.get("city")?.toString(),
    district: asOptionalString(formData.get("district")),
    dayOfWeek: formData.get("dayOfWeek")?.toString(),
    startTime: formData.get("startTime")?.toString(),
    endTime: asOptionalString(formData.get("endTime")),
    isOnline: asBoolean(formData.get("isOnline")),
    meetingLink: asOptionalString(formData.get("meetingLink")),
    latitude: asOptionalString(formData.get("latitude"))
      ? Number(formData.get("latitude")?.toString())
      : undefined,
    longitude: asOptionalString(formData.get("longitude"))
      ? Number(formData.get("longitude")?.toString())
      : undefined,
    addressAr: asOptionalString(formData.get("addressAr")),
    addressEn: asOptionalString(formData.get("addressEn")),
  });

  revalidatePath("/portal/meetings/recovery");
}

export async function createPortalInServiceMeetingAction(formData: FormData) {
  const rawActivities = formData.get("plannedActivities")?.toString().trim();
  let plannedActivities: Array<Record<string, unknown>> = [];

  if (rawActivities) {
    try {
      const parsed = JSON.parse(rawActivities) as Array<Record<string, unknown>>;
      plannedActivities = parsed;
    } catch {
      throw new Error("Planned activities must be valid JSON array.");
    }
  }

  await portalMutation("/api/v1/admin/meetings/in-service", "POST", {
    committeeId: formData.get("committeeId")?.toString(),
    meetingFormat: formData.get("meetingFormat")?.toString() ?? "PHYSICAL",
    titleAr: formData.get("titleAr")?.toString(),
    titleEn: formData.get("titleEn")?.toString(),
    description: asOptionalString(formData.get("description")),
    meetingDate: formData.get("meetingDate")?.toString(),
    startTime: formData.get("startTime")?.toString(),
    endTime: asOptionalString(formData.get("endTime")),
    venueName: asOptionalString(formData.get("venueName")),
    city: asOptionalString(formData.get("city")),
    district: asOptionalString(formData.get("district")),
    address: asOptionalString(formData.get("address")),
    zoomJoinUrl: asOptionalString(formData.get("zoomJoinUrl")),
    zoomMeetingId: asOptionalString(formData.get("zoomMeetingId")),
    zoomPasscode: asOptionalString(formData.get("zoomPasscode")),
    mom: formData.get("mom")?.toString(),
    plannedActivities,
    notes: asOptionalString(formData.get("notes")),
  });

  revalidatePath("/portal/meetings/in-service");
}

export async function updatePortalInServiceMeetingAction(formData: FormData) {
  const meetingId = formData.get("meetingId")?.toString();

  if (!meetingId) {
    throw new Error("Missing meeting id.");
  }

  const rawActivities = formData.get("plannedActivities")?.toString().trim();
  let plannedActivities: Array<Record<string, unknown>> = [];

  if (rawActivities) {
    try {
      const parsed = JSON.parse(rawActivities) as Array<Record<string, unknown>>;
      plannedActivities = parsed;
    } catch {
      throw new Error("Planned activities must be valid JSON array.");
    }
  }

  await portalMutation(`/api/v1/admin/meetings/in-service/${meetingId}`, "PATCH", {
    committeeId: formData.get("committeeId")?.toString(),
    meetingFormat: formData.get("meetingFormat")?.toString() ?? "PHYSICAL",
    titleAr: formData.get("titleAr")?.toString(),
    titleEn: formData.get("titleEn")?.toString(),
    description: asOptionalString(formData.get("description")),
    meetingDate: formData.get("meetingDate")?.toString(),
    startTime: formData.get("startTime")?.toString(),
    endTime: asOptionalString(formData.get("endTime")),
    venueName: asOptionalString(formData.get("venueName")),
    city: asOptionalString(formData.get("city")),
    district: asOptionalString(formData.get("district")),
    address: asOptionalString(formData.get("address")),
    zoomJoinUrl: asOptionalString(formData.get("zoomJoinUrl")),
    zoomMeetingId: asOptionalString(formData.get("zoomMeetingId")),
    zoomPasscode: asOptionalString(formData.get("zoomPasscode")),
    mom: formData.get("mom")?.toString(),
    plannedActivities,
    notes: asOptionalString(formData.get("notes")),
  });

  revalidatePath("/portal/meetings/in-service");
}

export async function submitPortalInServiceMeetingAction(formData: FormData) {
  const meetingId = formData.get("meetingId")?.toString();

  if (!meetingId) {
    throw new Error("Missing meeting id.");
  }

  await portalMutation(`/api/v1/admin/meetings/in-service/${meetingId}/submit`, "POST", {});
  revalidatePath("/portal/meetings/in-service");
}

export async function approvePortalInServiceMeetingAction(formData: FormData) {
  const meetingId = formData.get("meetingId")?.toString();

  if (!meetingId) {
    throw new Error("Missing meeting id.");
  }

  await portalMutation(`/api/v1/admin/meetings/in-service/${meetingId}/approve`, "POST", {});
  revalidatePath("/portal/meetings/in-service");
}

export async function rejectPortalInServiceMeetingAction(formData: FormData) {
  const meetingId = formData.get("meetingId")?.toString();

  if (!meetingId) {
    throw new Error("Missing meeting id.");
  }

  await portalMutation(`/api/v1/admin/meetings/in-service/${meetingId}/reject`, "POST", {
    comments: formData.get("comments")?.toString(),
  });
  revalidatePath("/portal/meetings/in-service");
}

export async function createPortalReportAction(formData: FormData) {
  const rawFilters = formData.get("filters")?.toString().trim();
  let filters: Record<string, unknown> = {};

  if (rawFilters) {
    try {
      const parsed = JSON.parse(rawFilters) as Record<string, unknown>;
      filters = parsed;
    } catch {
      throw new Error("Filters must be valid JSON.");
    }
  }

  await portalMutation("/api/v1/admin/reports", "POST", {
    type: formData.get("type")?.toString(),
    filters,
    approvalRequired: asBoolean(formData.get("approvalRequired")),
  });

  revalidatePath("/portal/reports");
}

export async function submitPortalReportAction(formData: FormData) {
  const reportId = formData.get("reportId")?.toString();

  if (!reportId) {
    throw new Error("Missing report id.");
  }

  await portalMutation(`/api/v1/admin/reports/${reportId}/submit`, "POST", {});
  revalidatePath("/portal/reports");
}

export async function approvePortalReportAction(formData: FormData) {
  const reportId = formData.get("reportId")?.toString();

  if (!reportId) {
    throw new Error("Missing report id.");
  }

  await portalMutation(`/api/v1/admin/reports/${reportId}/approve`, "POST", {});
  revalidatePath("/portal/reports");
}

export async function runPortalReportAction(formData: FormData) {
  const reportId = formData.get("reportId")?.toString();

  if (!reportId) {
    throw new Error("Missing report id.");
  }

  await portalMutation(`/api/v1/admin/reports/${reportId}/run`, "POST", {});
  revalidatePath("/portal/reports");
}

export async function updatePortalContactSubmissionAction(formData: FormData) {
  const submissionId = formData.get("submissionId")?.toString();

  if (!submissionId) {
    throw new Error("Missing submission id.");
  }

  await portalMutation(`/api/v1/admin/contact/${submissionId}`, "PATCH", {
    status: formData.get("status")?.toString(),
    internalNotes: asOptionalString(formData.get("internalNotes")),
  });

  revalidatePath("/portal/contact");
}

export async function createPortalResourceCategoryAction(formData: FormData) {
  await portalMutation("/api/v1/admin/resource-categories", "POST", {
    code: formData.get("code")?.toString(),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
  });

  revalidatePath("/portal/resources");
}

export async function updatePortalResourceCategoryAction(formData: FormData) {
  const categoryId = formData.get("categoryId")?.toString();

  if (!categoryId) {
    throw new Error("Missing category id.");
  }

  await portalMutation(`/api/v1/admin/resource-categories/${categoryId}`, "PATCH", {
    code: formData.get("code")?.toString(),
    nameAr: formData.get("nameAr")?.toString(),
    nameEn: formData.get("nameEn")?.toString(),
  });

  revalidatePath("/portal/resources");
}

export async function createPortalResourceAction(formData: FormData) {
  await portalMutation("/api/v1/admin/resources", "POST", {
    categoryId: formData.get("categoryId")?.toString(),
    titleAr: formData.get("titleAr")?.toString(),
    titleEn: formData.get("titleEn")?.toString(),
    descriptionAr: asOptionalString(formData.get("descriptionAr")),
    descriptionEn: asOptionalString(formData.get("descriptionEn")),
    filePath: formData.get("filePath")?.toString(),
    fileName: formData.get("fileName")?.toString(),
    mimeType: formData.get("mimeType")?.toString(),
    fileSize: Number(formData.get("fileSize")?.toString() ?? "0"),
    isPublic: asBoolean(formData.get("isPublic")),
  });

  revalidatePath("/portal/resources");
}
