import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface VerifiedIdentityProfile {
  email: string;
  displayName: string;
  externalSubject?: string;
  provider: 'GOOGLE' | 'ZOHO' | 'INTERNAL';
}

interface IdentityVerificationInput {
  provider: 'GOOGLE' | 'ZOHO' | 'INTERNAL';
  accessToken?: string;
  email?: string;
  displayName?: string;
  externalSubject?: string;
}

@Injectable()
export class IdentityProviderService {
  constructor(private readonly configService: ConfigService) {}

  private coerceString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  async verifyIdentity(
    input: IdentityVerificationInput,
  ): Promise<VerifiedIdentityProfile> {
    if (input.provider === 'INTERNAL') {
      if (!input.email || !input.displayName) {
        throw new UnauthorizedException(
          'Internal identity requires email and displayName.',
        );
      }

      return {
        provider: 'INTERNAL',
        email: input.email,
        displayName: input.displayName,
        externalSubject: input.externalSubject,
      };
    }

    if (input.accessToken) {
      return this.verifyRemoteIdentity(input.provider, input.accessToken);
    }

    const trustClaims =
      this.configService.get<string>('AUTH_TRUST_CLAIMS_IN_DEV') === 'true';
    const nodeEnv =
      this.configService.get<string>('app.nodeEnv') ?? 'development';

    if (
      trustClaims &&
      nodeEnv !== 'production' &&
      input.email &&
      input.displayName
    ) {
      return {
        provider: input.provider,
        email: input.email,
        displayName: input.displayName,
        externalSubject: input.externalSubject,
      };
    }

    throw new UnauthorizedException('Missing provider access token.');
  }

  private async verifyRemoteIdentity(
    provider: 'GOOGLE' | 'ZOHO',
    accessToken: string,
  ): Promise<VerifiedIdentityProfile> {
    const endpoint =
      provider === 'GOOGLE'
        ? this.configService.get<string>('app.googleUserinfoUrl') ??
          this.configService.get<string>('GOOGLE_USERINFO_URL')
        : this.configService.get<string>('app.zohoUserinfoUrl') ??
          this.configService.get<string>('ZOHO_USERINFO_URL');

    if (!endpoint) {
      throw new UnauthorizedException(
        `Missing ${provider} verification endpoint configuration.`,
      );
    }

    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedException(
        `${provider} identity verification failed.`,
      );
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const email = this.coerceString(payload['email'] ?? payload['Email']);
    const displayName = this.coerceString(
      payload['name'] ??
        payload['display_name'] ??
        payload['displayName'] ??
        payload['Name'],
    );
    const externalSubject = this.coerceString(
      payload['sub'] ?? payload['id'] ?? payload['ZUID'],
    );

    if (!email || !displayName) {
      throw new UnauthorizedException(
        `${provider} identity payload missing required fields.`,
      );
    }

    return {
      provider,
      email,
      displayName,
      externalSubject: externalSubject || undefined,
    };
  }
}
