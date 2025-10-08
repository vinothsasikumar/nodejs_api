import express from 'express';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/user.controller';
import { validate } from '../middlewares/validation.middleware';
import { UserSchema } from '../models/request/user.request.model';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:userid', getUserById);
router.post('/create', validate(UserSchema), createUser);
router.put('/update/:userid', validate(UserSchema), updateUser);
router.delete('/delete/:userid', deleteUser);

export default router;