import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { FitAnalysisService } from './fit-analysis.service';
import type { FitReport } from './schemas/fit-report.schema';
import type {
  generateText as GenerateTextFn,
  Output as OutputNamespace,
  APICallError as ApiCallErrorClass,
} from 'ai';

// `ai` and `@ai-sdk/openai` ship ESM-only, which Jest's default CJS transform can't parse.
// Mocking them outright (no jest.requireActual) avoids ever loading the real files.
// The stand-in class is declared *inside* the factory: jest.mock() calls are hoisted above
// normal declarations, so a class defined at module scope wouldn't be initialized yet here.
jest.mock('ai', () => {
  class MockAPICallError extends Error {
    isRetryable: boolean;
    constructor(opts: { message: string; isRetryable?: boolean }) {
      super(opts.message);
      this.name = 'APICallError';
      this.isRetryable = opts.isRetryable ?? false;
    }
  }
  return {
    generateText: jest.fn(),
    Output: { object: jest.fn((opts: unknown) => opts) },
    APICallError: MockAPICallError,
  };
});
jest.mock('@ai-sdk/openai', () => ({
  createOpenAI: jest.fn(() => jest.fn()),
}));

// jest.requireMock() returns `any` by default. Giving `aiMock` an explicit declared type (tied
// to the real 'ai' types via the type-only import above) makes everything destructured from it
// fully typed, without using an `as` assertion — a type annotation, not an assertion.
const aiMock: {
  generateText: jest.MockedFunction<typeof GenerateTextFn>;
  Output: typeof OutputNamespace;
  APICallError: typeof ApiCallErrorClass;
} = jest.requireMock('ai');
const { generateText: generateTextMock, APICallError } = aiMock;

describe('FitAnalysisService', () => {
  let service: FitAnalysisService;

  const prismaMock = { fitRequest: { create: jest.fn() } };
  const embeddingsMock = { embedText: jest.fn(), findSimilar: jest.fn() };
  const configMock = { get: jest.fn().mockReturnValue('test-api-key') };

  const report: FitReport = {
    matchScore: 80,
    summary: 'Good fit.',
    strengths: [{ point: 'React experience', citedSourceIndexes: [0] }],
    gaps: [],
    suggestedInterviewQuestions: ['Tell me about a React project.'],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    embeddingsMock.embedText.mockResolvedValue([0.1, 0.2]);
    embeddingsMock.findSimilar.mockResolvedValue([
      { sourceType: 'skill', sourceId: '1', content: 'React', distance: 0.1 },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FitAnalysisService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmbeddingsService, useValue: embeddingsMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get(FitAnalysisService);
  });

  it('returns the generated report and logs it as a FitRequest', async () => {
    generateTextMock.mockResolvedValue({ output: report });

    const result = await service.analyze('a'.repeat(60));

    expect(result).toEqual(report);
    expect(prismaMock.fitRequest.create).toHaveBeenCalledWith({
      data: {
        jobDescription: 'a'.repeat(60),
        matchScore: report.matchScore,
        result: report,
      },
    });
  });

  it('maps a retryable AI provider error to ServiceUnavailableException', async () => {
    generateTextMock.mockRejectedValue(
      new APICallError({ message: 'rate limited', isRetryable: true }),
    );

    await expect(service.analyze('a'.repeat(60))).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('maps an unexpected error to InternalServerErrorException', async () => {
    generateTextMock.mockRejectedValue(
      new Error('something unrelated broke'),
    );

    await expect(service.analyze('a'.repeat(60))).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('still returns the report even if logging the FitRequest fails', async () => {
    generateTextMock.mockResolvedValue({ output: report });
    prismaMock.fitRequest.create.mockRejectedValue(new Error('db unavailable'));

    const result = await service.analyze('a'.repeat(60));

    expect(result).toEqual(report);
  });
});
