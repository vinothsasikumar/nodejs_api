import * as jwt from 'jsonwebtoken';

const JWT_SECRET = '761805baa5260c5b828e9bd706d15434299b8fb58eb1e8f4112d4cdf145cc0b0ac650a9eb52a057b31af8cf1c8ed9a28e029c66358958f227bd06c5b4b457807';
const JWT_EXPIRE = 600000;

export const generateToken = (payload: string | object) => {
    const tokenPayload = typeof payload === 'string' ? { userId: payload } : payload;
    return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

export const validate = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
}