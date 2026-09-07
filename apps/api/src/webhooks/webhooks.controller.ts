import {
  Controller,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('sentry')
  async handleSentry(@Req() req: RawBodyRequest<Request>) {
    this.logger.log('Received a POST to /webhooks/sentry');

    const signature = req.headers['sentry-hook-signature'];
    if (typeof signature !== 'string' || !req.rawBody) {
      this.logger.warn('Request had no Sentry-Hook-Signature header');
      throw new UnauthorizedException('Missing Sentry webhook signature');
    }

    this.webhooksService.verifySentrySignature(req.rawBody, signature);
    await this.webhooksService.relayToSlack(req.body);

    return { received: true };
  }
}
