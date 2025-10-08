import { ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json(parsed.error);
        }

        req.body = parsed.data;
        next();
    }
}