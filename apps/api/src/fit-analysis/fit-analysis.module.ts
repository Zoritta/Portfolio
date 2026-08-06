import { Module } from '@nestjs/common';
import { FitAnalysisController } from './fit-analysis.controller';
import { FitAnalysisService } from './fit-analysis.service';
import { EmbeddingsModule } from '../embeddings/embeddings.module';

@Module({
  imports: [EmbeddingsModule],
  controllers: [FitAnalysisController],
  providers: [FitAnalysisService],
})
export class FitAnalysisModule {}
