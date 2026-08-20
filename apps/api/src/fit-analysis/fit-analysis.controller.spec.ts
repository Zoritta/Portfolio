import { Test, TestingModule } from '@nestjs/testing';
import { FitAnalysisController } from './fit-analysis.controller';
import { FitAnalysisService } from './fit-analysis.service';

// FitAnalysisService is only imported here for its DI token/type — but importing that module
// still executes its top-level `import ... from '@ai-sdk/openai'`/`'ai'`, which are ESM-only
// and would fail to parse under Jest. Mock them so those real files are never loaded.
jest.mock('ai', () => ({
  generateText: jest.fn(),
  Output: { object: jest.fn((opts: unknown) => opts) },
  APICallError: class extends Error {},
}));
jest.mock('@ai-sdk/openai', () => ({ createOpenAI: jest.fn(() => jest.fn()) }));

describe('FitAnalysisController', () => {
  let controller: FitAnalysisController;

  const serviceMock = { analyze: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FitAnalysisController],
      providers: [{ provide: FitAnalysisService, useValue: serviceMock }],
    }).compile();

    controller = module.get(FitAnalysisController);
  });

  it('delegates to FitAnalysisService.analyze with the job description', async () => {
    const report = { matchScore: 90 };
    serviceMock.analyze.mockResolvedValue(report);

    const result = await controller.analyze({ jobDescription: 'a'.repeat(60) });

    expect(result).toBe(report);
    expect(serviceMock.analyze).toHaveBeenCalledWith('a'.repeat(60));
  });
});
