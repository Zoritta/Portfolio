import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({ name: z.string().min(1) });
  const pipe = new ZodValidationPipe(schema);

  it('returns the parsed value when valid', () => {
    const result = pipe.transform({ name: 'Zohreh' });

    expect(result).toEqual({ name: 'Zohreh' });
  });

  it('throws BadRequestException when invalid', () => {
    expect(() => pipe.transform({ name: '' })).toThrow(BadRequestException);
  });
});
