class SqlMock {}

export class PrismaClient {
  user = {};
  assignment = {};
  region = {};
  area = {};
  committee = {};
  recoveryMeeting = {};
  event = {};
  eventBookingRequest = {};
  eventSlot = {};
  tentativeHold = {};
  zoomMeeting = {};
  eventPublicationStatus = {};
  eventStatusHistory = {};
  notificationLog = {};
  eventAuditLog = {};
  inServiceMeeting = {};
  resourceCategory = {};
  resource = {};
  contactSubmission = {};
  report = {};
  auditLog = {};

  $connect = async (): Promise<void> => {};
  $disconnect = async (): Promise<void> => {};
  $queryRaw = <T = unknown>(query: unknown): Promise<T> => {
    void query;
    return Promise.resolve({} as T);
  };
}

export const Prisma = {
  InputJsonValue: Object,
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => {
    void strings;
    void values;
    return new SqlMock();
  },
  join: (values: unknown[]) => values,
  Sql: SqlMock,
};

export type Assignment = {
  id: string;
  roleCode: string;
  scopeType: string;
  scopeId: string | null;
  scopeCode: string | null;
};
