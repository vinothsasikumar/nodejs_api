import express from 'express';
import { login } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema } from '../models/request/auth.request.model';

const router = express.Router();

router.post('/login', validate(loginSchema), login);

export default router;