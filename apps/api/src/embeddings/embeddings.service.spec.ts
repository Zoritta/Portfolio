import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from './embeddings.service';

const createMock = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: { create: createMock },
  }));
});

describe('EmbeddingsService', () => {
  let service: EmbeddingsService;

  const prismaMock = {
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  };
  const configMock = { get: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    configMock.get.mockReturnValue('test-api-key');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get(EmbeddingsService);
  });

  describe('embedText', () => {
    it('throws when OPENAI_API_KEY is not configured', async () => {
      configMock.get.mockReturnValue(undefined);

      await expect(service.embedText('hello')).rejects.toThrow('OPENAI_API_KEY is not set');
      expect(createMock).not.toHaveBeenCalled();
    });

    it('returns the embedding vector from the OpenAI client', async () => {
      createMock.mockResolvedValue({ data: [{ embedding: [0.1, 0.2, 0.3] }] });

      const result = await service.embedText('React and Next.js');

      expect(result).toEqual([0.1, 0.2, 0.3]);
      expect(createMock).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'React and Next.js',
      });
    });
  });

  describe('upsert', () => {
    it('embeds the content and writes it via a raw upsert', async () => {
      createMock.mockResolvedValue({ data: [{ embedding: [0.1, 0.2] }] });

      await service.upsert('skill', 'skill-1', 'TypeScript');

      expect(createMock).toHaveBeenCalledWith({ model: 'text-embedding-3-small', input: 'TypeScript' });
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe('findSimilar', () => {
    it('returns the rows from the raw cosine-distance query', async () => {
      const rows = [{ sourceType: 'skill', sourceId: '1', content: 'React', distance: 0.1 }];
      prismaMock.$queryRaw.mockResolvedValue(rows);

      const result = await service.findSimilar([0.1, 0.2], 5);

      expect(result).toBe(rows);
      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });
});
