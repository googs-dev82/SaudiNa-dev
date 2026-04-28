import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Prisma,
  PrismaClient,
  type PrismaClient as PrismaClientInstance,
} from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClientInstance;

  constructor() {
    const nodeEnv = process.env['NODE_ENV'] ?? 'development';
    const directUrl = process.env['DIRECT_URL'];
    const pooledUrl = process.env['DATABASE_URL'];
    const connectionString = pooledUrl ?? directUrl;

    if (!connectionString) {
      throw new Error(
        'Missing database connection string. Set DIRECT_URL and/or DATABASE_URL.',
      );
    }

    const pool = new pg.Pool({
      connectionString,
    });
    const adapter = new PrismaPg(pool);

    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }

  get user() {
    return this.client.user;
  }

  get assignment() {
    return this.client.assignments;
  }

  get region() {
    return this.client.region;
  }

  get area() {
    return this.client.area;
  }

  get committee() {
    return this.client.committee;
  }

  get recoveryMeeting() {
    return this.client.recoveryMeeting;
  }

  get inServiceMeeting() {
    return this.client.inServiceMeeting;
  }

  get resourceCategory() {
    return this.client.resourceCategory;
  }

  get resource() {
    return this.client.resource;
  }

  get contactSubmission() {
    return this.client.contactSubmission;
  }

  get report() {
    return this.client.report;
  }

  get event() {
    return this.client.event;
  }

  get eventBookingRequest() {
    return this.client.eventBookingRequest;
  }

  get eventSlot() {
    return this.client.eventSlot;
  }

  get tentativeHold() {
    return this.client.tentativeHold;
  }

  get zoomMeeting() {
    return this.client.zoomMeeting;
  }

  get eventPublicationStatus() {
    return this.client.eventPublicationStatus;
  }

  get eventStatusHistory() {
    return this.client.eventStatusHistory;
  }

  get notificationLog() {
    return this.client.notificationLog;
  }

  get eventAuditLog() {
    return this.client.eventAuditLog;
  }

  get auditLog() {
    return this.client.auditLog;
  }

  $queryRaw<T = unknown>(query: Prisma.Sql): Promise<T> {
    return this.client.$queryRaw<T>(query);
  }

  transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T> | T,
  ): Promise<T> {
    return this.client.$transaction(callback as never) as Promise<T>;
  }

  $transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T> | T,
  ): Promise<T> {
    return this.transaction(callback);
  }
}
