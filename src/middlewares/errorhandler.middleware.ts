import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    const isAppError = error instanceof AppError;
    const responseStatus = isAppError ? error.statusCode : 500;

    const payload = {
        message: isAppError ? error.message : 'Internal Server Error',
        statusCode: responseStatus
    }

    return res.status(responseStatus).json(payload);
}