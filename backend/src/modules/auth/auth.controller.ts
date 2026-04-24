import { Body, Controller, Get, Post, Redirect, Res } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { AuthService } from './auth.service.js';
import { ExchangeTokenDto } from './auth.dto.js';
import { Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('token')
  exchangeToken(@Body() input: ExchangeTokenDto) {
    return this.authService.exchangeToken(input);
  }

  @Public()
  @Post('google/token')
  exchangeGoogleToken(@Body() input: Omit<ExchangeTokenDto, 'provider'>) {
    return this.authService.exchangeGoogleToken(input);
  }

  @Public()
  @Post('zoho/token')
  exchangeZohoToken(@Body() input: Omit<ExchangeTokenDto, 'provider'>) {
    return this.authService.exchangeZohoToken(input);
  }

  @Public()
  @Get('google/start')
  @Redirect()
  googleStart(@Query('returnTo') returnTo?: string) {
    return { url: this.authService.getProviderStartUrl('GOOGLE', returnTo) };
  }

  @Public()
  @Get('zoho/start')
  @Redirect()
  zohoStart(@Query('returnTo') returnTo?: string) {
    return { url: this.authService.getProviderStartUrl('ZOHO', returnTo) };
  }

  @Public()
  @Get('google/callback')
  async googleCallback(
    @Res({ passthrough: true }) response: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('access_token') accessToken?: string,
    @Query('email') email?: string,
    @Query('displayName') displayName?: string,
  ) {
    if (code) {
      const resolvedAccessToken = await this.authService.exchangeProviderCode(
        'GOOGLE',
        code,
      );
      const returnTo = decodeReturnTo(
        state,
        this.configService.get<string>('app.frontendUrl') ??
          'http://localhost:3000',
      );
      response.redirect(
        `${returnTo}/auth/callback/google#access_token=${encodeURIComponent(
          resolvedAccessToken,
        )}`,
      );
      return;
    }

    return this.authService.exchangeGoogleToken({
      accessToken,
      email,
      displayName,
    });
  }

  @Public()
  @Get('zoho/callback')
  async zohoCallback(
    @Res({ passthrough: true }) response: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('access_token') accessToken?: string,
    @Query('email') email?: string,
    @Query('displayName') displayName?: string,
  ) {
    if (code) {
      const resolvedAccessToken = await this.authService.exchangeProviderCode(
        'ZOHO',
        code,
      );
      const returnTo = decodeReturnTo(
        state,
        this.configService.get<string>('app.frontendUrl') ??
          'http://localhost:3000',
      );
      response.redirect(
        `${returnTo}/auth/callback/zoho#access_token=${encodeURIComponent(
          resolvedAccessToken,
        )}`,
      );
      return;
    }

    return this.authService.exchangeZohoToken({
      accessToken,
      email,
      displayName,
    });
  }

  @Get('me')
  me(@CurrentUser() user: CurrentUserContext | undefined) {
    return user;
  }
}

function decodeReturnTo(
  state: string | undefined,
  frontendUrl: string,
): string {
  if (!state) {
    return `${frontendUrl.replace(/\/$/, '')}/portal`;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(state, 'base64url').toString('utf8'),
    ) as { returnTo?: string };
    const returnTo = parsed.returnTo ?? '/portal';

    if (!returnTo.startsWith('/')) {
      return `${frontendUrl.replace(/\/$/, '')}/portal`;
    }

    return `${frontendUrl.replace(/\/$/, '')}${returnTo}`;
  } catch {
    return `${frontendUrl.replace(/\/$/, '')}/portal`;
  }
}
