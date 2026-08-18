import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import type { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private resend: Resend | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getClient(): Resend {
    if (!this.resend) {
      const apiKey = this.config.get<string>('RESEND_API_KEY');
      if (!apiKey) {
        throw new Error(
          'RESEND_API_KEY is not set. Add it to apps/api/.env before sending contact messages.',
        );
      }
      this.resend = new Resend(apiKey);
    }
    return this.resend;
  }

  async send(dto: SendMessageDto): Promise<{ success: true }> {
    const { name, email, message, honeypot } = dto;

    // A filled honeypot field means a bot filled out every input it could find, including one
    // hidden from real users via CSS. Report success so the bot doesn't learn to look elsewhere,
    // but skip actually sending the email or logging it.
    if (honeypot) {
      this.logger.warn(
        'Contact form honeypot triggered — likely spam, message not sent',
      );
      return { success: true };
    }

    await this.sendEmail(name, email, message);
    await this.logMessage(name, email, message);
    return { success: true };
  }

  private async sendEmail(
    name: string,
    email: string,
    message: string,
  ): Promise<void> {
    const toAddress = this.config.get<string>('CONTACT_TO_EMAIL');
    if (!toAddress) {
      throw new Error(
        'CONTACT_TO_EMAIL is not set. Add it to apps/api/.env before sending contact messages.',
      );
    }

    try {
      const { error } = await this.getClient().emails.send({
        from: 'Portfolio Contact Form <onboarding@resend.dev>',
        to: toAddress,
        replyTo: email,
        subject: `New portfolio message from ${name}`,
        text: message,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      this.logger.error(
        'Failed to send contact email',
        error instanceof Error ? error.stack : error,
      );
      throw new ServiceUnavailableException(
        'Could not send your message right now. Please try again in a moment.',
      );
    }
  }

  private async logMessage(
    name: string,
    email: string,
    message: string,
  ): Promise<void> {
    try {
      await this.prisma.contactMessage.create({
        data: { name, email, message },
      });
    } catch (error) {
      // Logging the message is bookkeeping, not the user-facing feature — the email already
      // went out. Don't fail the request just because this write failed; log and move on.
      this.logger.error(
        'Failed to log ContactMessage',
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
