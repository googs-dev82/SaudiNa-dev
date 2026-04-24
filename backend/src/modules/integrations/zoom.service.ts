import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ZoomMeetingPayload {
  title: string;
  startAt: string;
  endAt: string;
  timezone: string;
  description?: string | null;
}

export interface ZoomMeetingResult {
  zoomMeetingId: string;
  joinUrl: string;
  hostUrl?: string | null;
  startUrl?: string | null;
  externalStatus: string;
}

@Injectable()
export class ZoomService {
  constructor(private readonly configService: ConfigService) {}

  private getConfig() {
    const clientId = this.configService.get<string>('ZOOM_CLIENT_ID') ?? '';
    const clientSecret =
      this.configService.get<string>('ZOOM_CLIENT_SECRET') ?? '';
    const accountId = this.configService.get<string>('ZOOM_ACCOUNT_ID') ?? '';

    if (!clientId || !clientSecret || !accountId) {
      throw new Error('Zoom integration is not configured.');
    }

    return { clientId, clientSecret, accountId };
  }

  private async getAccessToken() {
    const { clientId, clientSecret, accountId } = this.getConfig();
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Unable to obtain Zoom access token (${response.status}).`,
      );
    }

    const payload = (await response.json()) as { access_token?: string };
    if (!payload.access_token) {
      throw new Error('Zoom access token response was invalid.');
    }

    return payload.access_token;
  }

  async createMeeting(
    payload: ZoomMeetingPayload,
    idempotencyKey: string,
  ): Promise<ZoomMeetingResult> {
    const accessToken = await this.getAccessToken();
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        topic: payload.title,
        type: 2,
        start_time: payload.startAt,
        duration: Math.max(
          15,
          Math.ceil(
            (new Date(payload.endAt).getTime() -
              new Date(payload.startAt).getTime()) /
              60000,
          ),
        ),
        timezone: payload.timezone,
        agenda: payload.description ?? '',
        settings: {
          join_before_host: false,
          waiting_room: true,
          approval_type: 2,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Zoom meeting creation failed: ${response.status} ${body}`,
      );
    }

    const data = (await response.json()) as {
      id?: number | string;
      join_url?: string;
      start_url?: string;
      password?: string;
      status?: string;
    };

    if (!data.id || !data.join_url) {
      throw new Error('Zoom meeting response was invalid.');
    }

    return {
      zoomMeetingId: String(data.id),
      joinUrl: data.join_url,
      hostUrl: data.start_url ?? null,
      startUrl: data.start_url ?? null,
      externalStatus: data.status ?? 'created',
    };
  }

  async cancelMeeting(zoomMeetingId: string) {
    const accessToken = await this.getAccessToken();
    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${encodeURIComponent(zoomMeetingId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok && response.status !== 404) {
      const body = await response.text();
      throw new Error(
        `Zoom meeting cancellation failed: ${response.status} ${body}`,
      );
    }
  }
}
