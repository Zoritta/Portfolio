import { z } from 'zod';

export const analyzeJobSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(50, 'jobDescription must be at least 50 characters')
    .max(8000, 'jobDescription must be at most 8000 characters'),
});

export type AnalyzeJobDto = z.infer<typeof analyzeJobSchema>;
