import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContactService } from './contact.service';
import type { SendMessageDto } from './dto/send-message.dto';

const sendMock = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

describe('ContactService', () => {
  let service: ContactService;

  const prismaMock = { contactMessage: { create: jest.fn() } };
  const configValues: Record<string, string> = {
    RESEND_API_KEY: 'test-key',
    CONTACT_TO_EMAIL: 'zohrsadeghi@gmail.com',
  };
  const configMock = { get: jest.fn((key: string) => configValues[key]) };

  const dto: SendMessageDto = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello, I would like to connect.',
    honeypot: '',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get(ContactService);
  });

  it('sends the email and logs the message', async () => {
    sendMock.mockResolvedValue({ data: { id: '1' }, error: null });

    const result = await service.send(dto);

    expect(result).toEqual({ success: true });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'zohrsadeghi@gmail.com',
        replyTo: dto.email,
      }),
    );
    expect(prismaMock.contactMessage.create).toHaveBeenCalledWith({
      data: { name: dto.name, email: dto.email, message: dto.message },
    });
  });

  it('skips sending when the honeypot field is filled, but still reports success', async () => {
    const result = await service.send({ ...dto, honeypot: 'bot-filled-this' });

    expect(result).toEqual({ success: true });
    expect(sendMock).not.toHaveBeenCalled();
    expect(prismaMock.contactMessage.create).not.toHaveBeenCalled();
  });

  it('throws ServiceUnavailableException when Resend returns an error', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: 'provider down' },
    });

    await expect(service.send(dto)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('still returns success even if logging the ContactMessage fails', async () => {
    sendMock.mockResolvedValue({ data: { id: '1' }, error: null });
    prismaMock.contactMessage.create.mockRejectedValue(
      new Error('db unavailable'),
    );

    const result = await service.send(dto);

    expect(result).toEqual({ success: true });
  });
});
