import {
  Controller,
  Post,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('sentry')
  async handleSentry(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['sentry-hook-signature'];
    if (typeof signature !== 'string' || !req.rawBody) {
      throw new UnauthorizedException('Missing Sentry webhook signature');
    }

    this.webhooksService.verifySentrySignature(req.rawBody, signature);
    await this.webhooksService.relayToSlack(req.body);

    return { received: true };
  }
}
