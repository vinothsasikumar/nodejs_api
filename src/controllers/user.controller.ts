import { Request, Response } from 'express';
import { UserRequest } from '../models/request/user.request.model';
// import * as sqlService from '../services/user.sql.service';
import * as mongoService from '../services/user.mongo.service';

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await mongoService.getAllUsersFromMongo();
    return res.status(200).json(users);
};

export const getUserById = async (req: Request, res: Response) => {
    const userId = req.params.userid;

    const user = await mongoService.getUserByIdFromMongo(userId);
    if (!user) {
        return res.status(404).json('User data not found');
    }

    return res.status(200).json(user);
};

export const createUser = async (req: Request, res: Response) => {
    const userData = req.body as UserRequest;

    await mongoService.createUserInMongo(userData);

    return res.status(201).json('User created successfully');
};

export const updateUser = async (req: Request, res: Response) => {
    const userData = req.body as UserRequest;
    const userId = req.params.userid;

    const updated = await mongoService.updateUserInMongo(userId, userData);

    if (!updated) {
        return res.status(404).json('User data not found');
    }

    return res.status(200).json('User updated successfully');
};

export const deleteUser = async (req: Request, res: Response) => {
    const userId = (req.params.userid);

    const deleted = await mongoService.deleteUserFromMongo(userId);

    if (!deleted) {
        return res.status(404).json('User data not found');
    }

    return res.status(200).json('User deleted successfully');
};