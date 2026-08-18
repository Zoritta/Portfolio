import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { sendMessageSchema, type SendMessageDto } from './dto/send-message.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(sendMessageSchema))
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  send(@Body() body: SendMessageDto) {
    return this.contactService.send(body);
  }
}
