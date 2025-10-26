import { z } from 'zod';

export const loginSchema = z.object({
    userId: z.string()
});

export type LoginRequest = z.infer<typeof loginSchema>;