import { registerAs } from '@nestjs/config';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const environmentConfig = registerAs('app', () => ({
  ...(() => {
    const nodeEnv = process.env['NODE_ENV'] ?? 'development';
    const jwtSecret = process.env['JWT_SECRET'] ?? '';
    const databaseUrl = process.env['DATABASE_URL'] ?? '';
    const backendUrl =
      process.env['BACKEND_URL'] ??
      `http://localhost:${parseNumber(process.env['PORT'], 3001)}`;
    const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:3000';
    const googleClientId = process.env['GOOGLE_CLIENT_ID'] ?? '';
    const googleClientSecret = process.env['GOOGLE_CLIENT_SECRET'] ?? '';
    const zohoClientId = process.env['ZOHO_CLIENT_ID'] ?? '';
    const zohoClientSecret = process.env['ZOHO_CLIENT_SECRET'] ?? '';
    const zoomClientId = process.env['ZOOM_CLIENT_ID'] ?? '';
    const zoomClientSecret = process.env['ZOOM_CLIENT_SECRET'] ?? '';
    const zoomAccountId = process.env['ZOOM_ACCOUNT_ID'] ?? '';
    const zoomWebhookSecret = process.env['ZOOM_WEBHOOK_SECRET'] ?? '';

    if (!jwtSecret || jwtSecret === 'change_me_in_production') {
      throw new Error(
        'JWT_SECRET must be configured with a non-default value.',
      );
    }

    if (nodeEnv === 'production' && !databaseUrl) {
      throw new Error('DATABASE_URL must be configured in production.');
    }

    if (!backendUrl || !frontendUrl) {
      throw new Error('BACKEND_URL and FRONTEND_URL must be configured.');
    }

    if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
      throw new Error(
        'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together.',
      );
    }

    if (Boolean(zohoClientId) !== Boolean(zohoClientSecret)) {
      throw new Error(
        'ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET must be configured together.',
      );
    }

    if (
      Boolean(zoomClientId) !== Boolean(zoomClientSecret) ||
      Boolean(zoomClientId) !== Boolean(zoomAccountId)
    ) {
      throw new Error(
        'ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, and ZOOM_ACCOUNT_ID must be configured together.',
      );
    }

    return {
      nodeEnv,
      jwtSecret,
      databaseUrl,
      backendUrl,
      frontendUrl,
      appTimeZone: process.env['APP_TIME_ZONE'] ?? 'Asia/Riyadh',
      googleClientId,
      googleClientSecret,
      zohoClientId,
      zohoClientSecret,
      zoomClientId,
      zoomClientSecret,
      zoomAccountId,
      zoomWebhookSecret,
    };
  })(),
  port: parseNumber(process.env['PORT'], 3001),
  directUrl: process.env['DIRECT_URL'] ?? '',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '1h',
  prCommitteeCode: process.env['PR_COMMITTEE_CODE'] ?? 'PR_COMMITTEE',
  googleAuthUrl:
    process.env['GOOGLE_AUTH_URL'] ??
    'https://accounts.google.com/o/oauth2/v2/auth',
  googleTokenUrl:
    process.env['GOOGLE_TOKEN_URL'] ?? 'https://oauth2.googleapis.com/token',
  googleUserinfoUrl:
    process.env['GOOGLE_USERINFO_URL'] ??
    'https://www.googleapis.com/oauth2/v3/userinfo',
  zohoAuthUrl:
    process.env['ZOHO_AUTH_URL'] ?? 'https://accounts.zoho.com/oauth/v2/auth',
  zohoTokenUrl:
    process.env['ZOHO_TOKEN_URL'] ?? 'https://accounts.zoho.com/oauth/v2/token',
  zohoUserinfoUrl:
    process.env['ZOHO_USERINFO_URL'] ??
    'https://accounts.zoho.com/oauth/user/info',
}));

export type EnvironmentConfig = ReturnType<typeof environmentConfig>;
