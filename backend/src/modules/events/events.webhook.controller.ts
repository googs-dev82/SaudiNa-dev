import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/public.decorator.js';
import { EventsService } from './events.service.js';

@Public()
@Controller('webhooks/zoom')
export class EventsWebhookController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  handle(
    @Req() request: Request & { rawBody?: Buffer },
    @Headers('x-zm-signature') signature?: string,
    @Headers('x-zm-request-timestamp') timestamp?: string,
    @Body() payload?: Record<string, unknown>,
  ) {
    this.verifySignature(request.rawBody, signature, timestamp);
    return this.eventsService.handleWebhook(payload ?? {});
  }

  private verifySignature(
    rawBody: Buffer | undefined,
    signature: string | undefined,
    timestamp: string | undefined,
  ) {
    const webhookSecret =
      this.configService.get<string>('app.zoomWebhookSecret') ?? '';

    if (!webhookSecret) {
      throw new BadRequestException('Zoom webhook secret is not configured.');
    }

    if (!rawBody || !signature || !timestamp) {
      throw new BadRequestException('Missing Zoom webhook signature.');
    }

    const signedPayload = `v0:${timestamp}:${rawBody.toString('utf8')}`;
    const expected = createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    const provided = signature.startsWith('v0=')
      ? signature.slice(3)
      : signature;

    if (
      expected.length !== provided.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
    ) {
      throw new BadRequestException('Invalid Zoom webhook signature.');
    }
  }
}
