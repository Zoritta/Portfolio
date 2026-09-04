import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('sentry-webhook-test-tmp')
  throwTestError(): never {
    throw new Error('Sentry test error: webhook relay end-to-end check');
  }
}
