import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { AssignmentsModule } from '../assignments/assignments.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('app.jwtSecret');

        if (!secret || secret === 'change_me_in_production') {
          throw new Error(
            'JWT secret is not configured. Refusing to bootstrap AuthModule.',
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('app.jwtExpiresIn') ??
              '1h') as StringValue,
          },
        };
      },
    }),
    UsersModule,
    AssignmentsModule,
    AuditModule,
    IntegrationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
