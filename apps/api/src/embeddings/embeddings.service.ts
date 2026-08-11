import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

const EMBEDDING_MODEL = 'text-embedding-3-small';

export type SimilarEmbedding = {
  sourceType: string;
  sourceId: string;
  content: string;
  distance: number;
};

@Injectable()
export class EmbeddingsService {
  private openai: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getClient(): OpenAI {
    if (!this.openai) {
      const apiKey = this.config.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        throw new Error(
          'OPENAI_API_KEY is not set. Add it to apps/api/.env before generating embeddings.',
        );
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  async embedText(text: string): Promise<number[]> {
    const response = await this.getClient().embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  }

  async upsert(
    sourceType: string,
    sourceId: string,
    content: string,
  ): Promise<void> {
    const embedding = await this.embedText(content);
    const vectorLiteral = `[${embedding.join(',')}]`;

    await this.prisma.$executeRaw`
      INSERT INTO "Embedding" (id, "sourceType", "sourceId", content, embedding, "createdAt")
      VALUES (${randomUUID()}, ${sourceType}, ${sourceId}, ${content}, ${vectorLiteral}::vector, now())
      ON CONFLICT ("sourceType", "sourceId")
      DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding
    `;
  }

  /** Returns the `limit` Embedding rows whose vectors are closest (cosine distance) to `queryEmbedding`. */
  async findSimilar(
    queryEmbedding: number[],
    limit: number,
  ): Promise<SimilarEmbedding[]> {
    const vectorLiteral = `[${queryEmbedding.join(',')}]`;

    return this.prisma.$queryRaw<SimilarEmbedding[]>`
      SELECT "sourceType", "sourceId", "content", (embedding <=> ${vectorLiteral}::vector) as distance
      FROM "Embedding"
      ORDER BY distance ASC
      LIMIT ${limit}
    `;
  }
}
