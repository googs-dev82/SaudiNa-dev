export type PortalRole =
  | "SUPER_ADMIN"
  | "REGIONAL_MANAGER"
  | "AREA_MANAGER"
  | "COMMITTEE_MANAGER"
  | "COMMITTEE_SECRETARY"
  | "MEETING_EDITOR"
  | "CONTENT_EDITOR";

export interface PortalAssignment {
  id: string;
  roleCode: PortalRole;
  scopeType: "GLOBAL" | "REGION" | "AREA" | "COMMITTEE";
  scopeId: string | null;
  scopeCode: string | null;
}

export interface PortalUser {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: "ar" | "en";
  roles: PortalRole[];
  assignments: PortalAssignment[];
}

export interface AuthExchangeResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: PortalRole[];
  };
}
