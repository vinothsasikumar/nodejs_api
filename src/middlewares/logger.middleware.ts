import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

morgan.token("time", () => {
    return new Date().toISOString();
});

const logstream = fs.createWriteStream(
    path.join(__dirname, '../logs/applogs.log'),
    {
        flags: 'a'
    }
)

export const httpLogger = morgan(":time :method :url :status - :response-time ms", {
    stream: logstream
});