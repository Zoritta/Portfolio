import { z } from 'zod';

export const sendMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'name must be at least 2 characters')
    .max(100, 'name must be at most 100 characters'),
  email: z.string().trim().email('email must be a valid email address'),
  message: z
    .string()
    .trim()
    .min(10, 'message must be at least 10 characters')
    .max(5000, 'message must be at most 5000 characters'),
  // Hidden field, invisible to real users via CSS. A filled-in value means a bot filled out
  // every input it could find — see ContactService.send for how this is used.
  honeypot: z.string().max(200).optional().default(''),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
