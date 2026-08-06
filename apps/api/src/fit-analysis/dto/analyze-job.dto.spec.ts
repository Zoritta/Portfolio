import { analyzeJobSchema } from './analyze-job.dto';

describe('analyzeJobSchema', () => {
  it('accepts a well-formed job description', () => {
    const result = analyzeJobSchema.safeParse({
      jobDescription: 'a'.repeat(100),
    });

    expect(result.success).toBe(true);
  });

  it('rejects a job description shorter than 50 characters', () => {
    const result = analyzeJobSchema.safeParse({
      jobDescription: 'too short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a job description longer than 8000 characters', () => {
    const result = analyzeJobSchema.safeParse({
      jobDescription: 'a'.repeat(8001),
    });

    expect(result.success).toBe(false);
  });

  it('rejects a missing jobDescription field', () => {
    const result = analyzeJobSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
