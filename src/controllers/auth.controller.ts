import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { userDatabase } from '../database/user.database';
import { generateToken } from '../utilities/jwt';

export const login = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const user = await userDatabase.findById(userId);

        if (!user) {
            return res.status(401).json({ message: 'Invalid User ID' });
        }

        const token = generateToken(userId);
        return res.json({ token, user });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}