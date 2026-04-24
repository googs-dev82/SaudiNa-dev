import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/index.js';
import { environmentConfig } from './config/environment.config.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { RateLimitGuard } from './common/guards/rate-limit.guard.js';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor.js';
import { RateLimitService } from './common/services/rate-limit.service.js';
import { AuthorizationService } from './common/services/authorization.service.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AssignmentsModule } from './modules/assignments/assignments.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RegionsModule } from './modules/regions/regions.module.js';
import { AreasModule } from './modules/areas/areas.module.js';
import { CommitteesModule } from './modules/committees/committees.module.js';
import { MeetingsModule } from './modules/meetings/meetings.module.js';
import { EventsModule } from './modules/events/events.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { ResourcesModule } from './modules/resources/resources.module.js';
import { ContactModule } from './modules/contact/contact.module.js';
import { ChatbotModule } from './modules/chatbot/chatbot.module.js';
import { ResourceCategoriesModule } from './modules/resource-categories/resource-categories.module.js';
import { IntegrationsModule } from './modules/integrations/integrations.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [environmentConfig],
    }),
    PrismaModule,
    HealthModule,
    AuditModule,
    UsersModule,
    AssignmentsModule,
    AuthModule,
    RegionsModule,
    AreasModule,
    CommitteesModule,
    MeetingsModule,
    EventsModule,
    ReportsModule,
    ResourcesModule,
    ResourceCategoriesModule,
    ContactModule,
    ChatbotModule,
    IntegrationsModule,
  ],
  providers: [
    RateLimitService,
    AuthorizationService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}
