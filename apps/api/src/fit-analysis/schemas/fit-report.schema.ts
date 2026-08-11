import { z } from 'zod';

export const fitReportSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'Overall fit score from 0-100, based only on the provided sources.',
    ),
  summary: z
    .string()
    .describe('A 2-3 sentence honest summary of the overall fit.'),
  strengths: z
    .array(
      z.object({
        point: z
          .string()
          .describe('A specific strength relevant to the job description.'),
        citedSourceIndexes: z
          .array(z.number())
          .describe('Indexes (from the SOURCES list) that support this point.'),
      }),
    )
    .describe('Concrete reasons the candidate fits, grounded in the sources.'),
  gaps: z
    .array(
      z.object({
        point: z
          .string()
          .describe('A specific gap or mismatch versus the job description.'),
      }),
    )
    .describe(
      'Honest gaps — things the job asks for that the sources do not support.',
    ),
  suggestedInterviewQuestions: z
    .array(z.string())
    .describe(
      '3-5 questions an interviewer might reasonably ask given this fit analysis.',
    ),
});

export type FitReport = z.infer<typeof fitReportSchema>;
