import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import swagger from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

import swaggerDocument from './swagger/swagger.json';
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.routes';
import { errorHandler } from './middlewares/errorhandler.middleware';
import { httpLogger } from './middlewares/logger.middleware';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(httpLogger);

mongoose.connect('mongodb://localhost:27017/crud')
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(() => {
        console.log('MongoDB connection failed');
    });

app.use('/api-docs', swagger.serve, swagger.setup(swaggerDocument));

app.use('/users', userRouter);
app.use('/auth', authRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost: ${PORT}`);
});