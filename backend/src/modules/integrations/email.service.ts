import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async send(message: EmailMessage): Promise<{ delivered: boolean }> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from =
      this.configService.get<string>('SUPPORT_EMAIL_FROM') ??
      'SaudiNA <noreply@example.com>';

    if (!apiKey) {
      this.logger.warn(
        `Resend API key not configured. Email skipped for ${message.to}.`,
      );
      return { delivered: false };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Email delivery failed: ${response.status} ${errorBody}`);
    }

    return { delivered: true };
  }
}
