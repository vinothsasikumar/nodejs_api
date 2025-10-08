import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from './routes/user.routes';
import { errorHandler } from './middlewares/errorhandler.middleware';
import { httpLogger } from './middlewares/logger.middleware';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(httpLogger);

mongoose.connect('mongodb://localhost:27017/crud')
    .then(() => { console.log('MongoDB connected successfully') })
    .catch(() => { console.log('MongoDB connection failed') });

app.use('/users', userRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`API is running in http://localhost:${PORT}`);
});