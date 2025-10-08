import { z } from 'zod';

export const UserSchema = z.object({
    name: z.string().min(5, 'Name should be minimum of 5 characters').max(50, 'Name should not exceed 50 characters'),
    email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    phone: z.string(),
    website: z.string()
});

export type UserRequest = z.infer<typeof UserSchema>;

// export interface UserRequest {
//     name: string;
//     email: string;
//     phone: string;
//     website: string;
// }