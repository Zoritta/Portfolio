import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FitAnalysisService } from './fit-analysis.service';
import { analyzeJobSchema, type AnalyzeJobDto } from './dto/analyze-job.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('fit-analysis')
export class FitAnalysisController {
  constructor(private readonly fitAnalysisService: FitAnalysisService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(analyzeJobSchema))
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  analyze(@Body() body: AnalyzeJobDto) {
    return this.fitAnalysisService.analyze(body.jobDescription);
  }
}
