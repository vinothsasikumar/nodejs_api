import { Request, Response, NextFunction } from 'express';
import { validate } from '../utilities/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authenticationHeader = req.headers.authorization;
        if (!authenticationHeader || !authenticationHeader.startsWith('Bearer ')) {
            return res.status(401).json('User is not authenticated');
        }

        const token = authenticationHeader.split(' ')[1];
        const payload = validate(token);
        next();
    }
    catch (err) {
        return res.status(401).json(err);
    }
}