import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import type { SendMessageDto } from './dto/send-message.dto';

describe('ContactController', () => {
  let controller: ContactController;

  const serviceMock = { send: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [{ provide: ContactService, useValue: serviceMock }],
    }).compile();

    controller = module.get(ContactController);
  });

  it('delegates to ContactService.send with the request body', async () => {
    const dto: SendMessageDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'a'.repeat(20),
      honeypot: '',
    };
    serviceMock.send.mockResolvedValue({ success: true });

    const result = await controller.send(dto);

    expect(result).toEqual({ success: true });
    expect(serviceMock.send).toHaveBeenCalledWith(dto);
  });
});
