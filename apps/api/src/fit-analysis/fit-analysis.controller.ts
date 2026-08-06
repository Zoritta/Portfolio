import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { FitAnalysisService } from './fit-analysis.service';
import { analyzeJobSchema, type AnalyzeJobDto } from './dto/analyze-job.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('fit-analysis')
export class FitAnalysisController {
  constructor(private readonly fitAnalysisService: FitAnalysisService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(analyzeJobSchema))
  analyze(@Body() body: AnalyzeJobDto) {
    return this.fitAnalysisService.analyze(body.jobDescription);
  }
}
