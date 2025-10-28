import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utilities/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authenticationHeader = req.headers.authorization;
    if (!authenticationHeader || !authenticationHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'User is not authenticated' });
    }

    const token = authenticationHeader.split(' ')[1];
    try {
        const payload = verifyToken(token) as any;
        
        if (!payload || (!payload.userId && !payload.id)) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }

        (req as any).user = payload;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}