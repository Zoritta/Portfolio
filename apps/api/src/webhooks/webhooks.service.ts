import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly config: ConfigService) {}

  verifySentrySignature(rawBody: Buffer, signature: string): void {
    const secret = this.config.get<string>('SENTRY_WEBHOOK_SECRET');
    if (!secret) {
      throw new Error(
        'SENTRY_WEBHOOK_SECRET is not set. Add it to apps/api/.env before enabling the Sentry-to-Slack relay.',
      );
    }

    const expected = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    const providedBuffer = Buffer.from(signature, 'hex');

    // timingSafeEqual throws if buffer lengths differ, so check that first rather than let a
    // malformed/short header value crash the request instead of cleanly rejecting it.
    const isValid =
      expectedBuffer.length === providedBuffer.length &&
      timingSafeEqual(expectedBuffer, providedBuffer);

    if (!isValid) {
      throw new UnauthorizedException('Invalid Sentry webhook signature');
    }
  }

  async relayToSlack(payload: unknown): Promise<void> {
    const webhookUrl = this.config.get<string>('SLACK_WEBHOOK_URL');
    if (!webhookUrl) {
      this.logger.warn('SLACK_WEBHOOK_URL is not set — skipping Slack relay');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: this.formatMessage(payload) }),
      });
      if (!response.ok) {
        this.logger.error(`Slack webhook responded with ${response.status}`);
      }
    } catch (error) {
      // This alert failing to send shouldn't itself become an unhandled error — log it and move
      // on, rather than let the webhook request fail (Sentry already has the original error
      // regardless of whether this relay step succeeds).
      this.logger.error(
        'Failed to relay Sentry alert to Slack',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  // Sentry's webhook payload shape differs depending on which kind of event triggered it, and
  // isn't fully pinned down in their docs. Extract the useful fields defensively, and fall back
  // to a raw dump so a shape we didn't anticipate still shows up in Slack instead of vanishing.
  private formatMessage(payload: unknown): string {
    if (typeof payload === 'object' && payload !== null) {
      const data = (payload as Record<string, unknown>).data as
        | Record<string, unknown>
        | undefined;
      const event = data?.event as Record<string, unknown> | undefined;
      const issue = data?.issue as Record<string, unknown> | undefined;

      const title = (event?.title ?? issue?.title) as string | undefined;
      const culprit = (event?.culprit ?? issue?.culprit) as
        | string
        | undefined;
      const url = (issue?.web_url ?? event?.web_url ?? issue?.url) as
        | string
        | undefined;

      if (title) {
        const lines = [`*Sentry alert:* ${title}`];
        if (culprit) lines.push(`Where: ${culprit}`);
        if (url) lines.push(url);
        return lines.join('\n');
      }
    }

    return `*Sentry alert* (unrecognized payload shape):\n\`\`\`${JSON.stringify(
      payload,
      null,
      2,
    ).slice(0, 1500)}\`\`\``;
  }
}
