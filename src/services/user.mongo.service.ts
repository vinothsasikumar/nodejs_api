import { userDatabase } from '../database/user.database';
import { UserRequest } from '../models/request/user.request.model';

export const getAllUsersFromMongo = async () => {
    return await userDatabase.find();
};

export const getUserByIdFromMongo = async (userId: string) => {
    return await userDatabase.findById(userId);
};

export const createUserInMongo = async (userData: UserRequest) => {
    return await userDatabase.create(userData);
};

export const updateUserInMongo = async (userId: string, userData: UserRequest) => {
    return await userDatabase.findByIdAndUpdate(userId, userData);
};

export const deleteUserFromMongo = async (userId: string) => {
    return await userDatabase.findByIdAndDelete(userId);
};
