import { sendMessageSchema } from './send-message.dto';

describe('sendMessageSchema', () => {
  it('accepts a well-formed message', () => {
    const result = sendMessageSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'a'.repeat(20),
    });

    expect(result.success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = sendMessageSchema.safeParse({
      name: 'J',
      email: 'jane@example.com',
      message: 'a'.repeat(20),
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid email address', () => {
    const result = sendMessageSchema.safeParse({
      name: 'Jane Doe',
      email: 'not-an-email',
      message: 'a'.repeat(20),
    });

    expect(result.success).toBe(false);
  });

  it('rejects a message shorter than 10 characters', () => {
    const result = sendMessageSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('defaults honeypot to an empty string when omitted', () => {
    const result = sendMessageSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'a'.repeat(20),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.honeypot).toBe('');
    }
  });
});
