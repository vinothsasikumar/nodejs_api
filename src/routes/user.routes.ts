import express from 'express';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/user.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { UserSchema } from '../models/request/user.request.model';

const router = express.Router();

router.get('/', authenticate, getAllUsers);
router.get('/:userid', authenticate, getUserById);
router.post('/create', authenticate, validate(UserSchema), createUser);
router.put('/update/:userid', authenticate, validate(UserSchema), updateUser);
router.delete('/delete/:userid', authenticate, deleteUser);

export default router;