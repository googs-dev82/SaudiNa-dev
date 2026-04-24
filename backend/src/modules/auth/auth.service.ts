import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { AssignmentsService } from '../assignments/assignments.service.js';
import { UsersService } from '../users/users.service.js';
import { ExchangeTokenDto } from './auth.dto.js';
import { AuditService } from '../audit/audit.service.js';
import { IdentityProviderService } from '../integrations/identity-provider.service.js';

type SupportedProvider = 'GOOGLE' | 'ZOHO';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly assignmentsService: AssignmentsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    private readonly identityProviderService: IdentityProviderService,
  ) {}

  async exchangeToken(input: ExchangeTokenDto) {
    const profile = await this.identityProviderService.verifyIdentity({
      provider: input.provider,
      accessToken: input.accessToken,
      email: input.email,
      displayName: input.displayName,
      externalSubject: input.externalSubject,
    });

    const user = await this.usersService.upsertExternalIdentity({
      email: profile.email,
      displayName: profile.displayName,
      provider: profile.provider,
      externalSubject: profile.externalSubject,
    });

    const assignments =
      await this.assignmentsService.getActiveAssignmentsForUser(user.id);
    const roles = [
      ...new Set(assignments.map((assignment) => assignment.roleCode)),
    ].map((role) => String(role));
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.get<string>('app.jwtSecret'),
        expiresIn: (this.configService.get<string>('app.jwtExpiresIn') ??
          '1h') as StringValue,
      },
    );

    await this.auditService.log({
      action: 'LOGIN',
      resourceType: 'Auth',
      resourceId: user.id,
      userId: user.id,
      userRoleSnapshot: roles.join(','),
      metadata: { provider: profile.provider },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles,
      },
    };
  }

  exchangeGoogleToken(input: Omit<ExchangeTokenDto, 'provider'>) {
    return this.exchangeToken({ ...input, provider: 'GOOGLE' });
  }

  exchangeZohoToken(input: Omit<ExchangeTokenDto, 'provider'>) {
    return this.exchangeToken({ ...input, provider: 'ZOHO' });
  }

  getProviderStartUrl(provider: SupportedProvider, returnTo?: string) {
    const backendUrl =
      this.configService.get<string>('app.backendUrl') ??
      'http://localhost:3001';
    const callbackPath =
      provider === 'GOOGLE'
        ? '/api/v1/auth/google/callback'
        : '/api/v1/auth/zoho/callback';
    const authUrl =
      provider === 'GOOGLE'
        ? this.configService.get<string>('app.googleAuthUrl')
        : this.configService.get<string>('app.zohoAuthUrl');
    const clientId =
      provider === 'GOOGLE'
        ? this.configService.get<string>('app.googleClientId')
        : this.configService.get<string>('app.zohoClientId');

    if (!authUrl || !clientId) {
      throw new ServiceUnavailableException(
        `${provider} OAuth is not configured.`,
      );
    }

    const statePayload = Buffer.from(
      JSON.stringify({
        returnTo: returnTo && returnTo.startsWith('/') ? returnTo : '/portal',
      }),
    ).toString('base64url');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${backendUrl.replace(/\/$/, '')}${callbackPath}`,
      response_type: 'code',
      scope:
        provider === 'GOOGLE' ? 'openid email profile' : 'openid profile email',
      access_type: 'offline',
      prompt: 'consent',
      state: statePayload,
    });

    return `${authUrl}?${params.toString()}`;
  }

  async exchangeProviderCode(provider: SupportedProvider, code: string) {
    const tokenUrl =
      provider === 'GOOGLE'
        ? this.configService.get<string>('app.googleTokenUrl')
        : this.configService.get<string>('app.zohoTokenUrl');
    const clientId =
      provider === 'GOOGLE'
        ? this.configService.get<string>('app.googleClientId')
        : this.configService.get<string>('app.zohoClientId');
    const clientSecret =
      provider === 'GOOGLE'
        ? this.configService.get<string>('app.googleClientSecret')
        : this.configService.get<string>('app.zohoClientSecret');

    const backendUrl =
      this.configService.get<string>('app.backendUrl') ??
      'http://localhost:3001';
    const callbackPath =
      provider === 'GOOGLE'
        ? '/api/v1/auth/google/callback'
        : '/api/v1/auth/zoho/callback';

    if (!tokenUrl || !clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        `${provider} token exchange is not configured.`,
      );
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${backendUrl.replace(/\/$/, '')}${callbackPath}`,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new UnauthorizedException(`${provider} code exchange failed.`);
    }

    const payload = (await response.json()) as {
      access_token?: string;
    };

    if (!payload.access_token) {
      throw new UnauthorizedException(
        `${provider} response missing access token.`,
      );
    }

    return payload.access_token;
  }

  async authenticateBearerToken(token: string): Promise<CurrentUserContext> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token, {
        secret: this.configService.get<string>('app.jwtSecret'),
      });

      const user = await this.usersService.getById(payload.sub);

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User is inactive.');
      }

      const assignments =
        await this.assignmentsService.getActiveAssignmentsForUser(user.id);

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        preferredLanguage: user.preferredLanguage === 'en' ? 'en' : 'ar',
        roles: [
          ...new Set(assignments.map((assignment) => assignment.roleCode)),
        ].map((role) => String(role)),
        assignments: assignments.map((assignment) => ({
          id: assignment.id,
          roleCode: String(assignment.roleCode),
          scopeType: String(assignment.scopeType),
          scopeId: assignment.scopeId,
          scopeCode: assignment.scopeCode,
        })),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid access token.');
    }
  }
}
