import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SkillsModule } from './skills/skills.module';
import { ExperienceModule } from './experience/experience.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { FitAnalysisModule } from './fit-analysis/fit-analysis.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 60 }],
    }),
    PrismaModule,
    ProjectsModule,
    SkillsModule,
    ExperienceModule,
    EmbeddingsModule,
    FitAnalysisModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
  ],
})
export class AppModule {}
