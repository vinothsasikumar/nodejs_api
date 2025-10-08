// import { connectionPool } from '../database/user.database';
// import { UserRequest } from '../models/request/user.request.model';
// import sql from 'mssql';

// export const getAllUsersFromSQL = async () => {
//     const pool = await connectionPool;
//     const result = await pool.request().query('SELECT * FROM Users');
//     return result.recordset;
// };

// export const getUserByIdFromSQL = async (userId: number) => {
//     const pool = await connectionPool;
//     const result = await pool.request()
//         .input('id', sql.Int, userId)
//         .query('SELECT * FROM Users WHERE Id = @id');
//     return result.recordset[0];
// };

// export const createUserInSQL = async (userData: UserRequest) => {
//     const pool = await connectionPool;
//     await pool.request()
//         .input('name', sql.NVarChar, userData.name)
//         .input('email', sql.NVarChar, userData.email)
//         .input('phone', sql.NVarChar, userData.phone)
//         .input('website', sql.NVarChar, userData.website)
//         .query('INSERT INTO Users (Name, Email, Phone, Website) VALUES (@name, @email, @phone, @website)');
// };

// export const updateUserInSQL = async (userId: number, userData: UserRequest) => {
//     const pool = await connectionPool;
//     const result = await pool.request()
//         .input('id', sql.Int, userId)
//         .input('name', sql.NVarChar, userData.name)
//         .input('email', sql.NVarChar, userData.email)
//         .input('phone', sql.NVarChar, userData.phone)
//         .input('website', sql.NVarChar, userData.website)
//         .query('UPDATE Users SET Name = @name, Email = @email, Phone = @phone, Website = @website WHERE Id = @id');
//     return result.rowsAffected[0] > 0;
// };

// export const deleteUserFromSQL = async (userId: number) => {
//     const pool = await connectionPool;
//     const result = await pool.request()
//         .input('id', sql.Int, userId)
//         .query('DELETE FROM Users WHERE Id = @id');
//     return result.rowsAffected[0] > 0;
// };
