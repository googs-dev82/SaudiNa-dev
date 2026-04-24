export interface ActiveAssignment {
  id: string;
  roleCode: string;
  scopeType: string;
  scopeId: string | null;
  scopeCode: string | null;
}

export interface CurrentUserContext {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: 'ar' | 'en';
  roles: string[];
  assignments: ActiveAssignment[];
}

export interface RequestWithContext {
  user?: CurrentUserContext;
  correlationId?: string;
  ip?: string;
}
