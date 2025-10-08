// import { UserResponse } from "../models/response/user.response.model";

import mongoose from "mongoose";

// export const userDatabase: UserResponse[] = [
//     { id: 1, name: 'Madhu', email: 'madhu@gmail.com', phone: '9876543213', website: 'https://madhu.com' },
//     { id: 2, name: 'Livya', email: 'livya@gmail.com', phone: '9898767658', website: 'https://livya.com' },
//     { id: 3, name: 'Ilavarasi', email: 'ilavarasi@gmail.com', phone: '9776634245', website: 'https://ilavarasi.com' },
//     { id: 4, name: 'Amar', email: 'amar@gmail.com', phone: '9800755463', website: 'https://amar.com' },
//     { id: 5, name: 'Vijay', email: 'vijay@gmail.com', phone: '9823567126', website: 'https://vijay.com' },
// ];

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
}, { collection: 'user' });

export const userDatabase = mongoose.model('user', userSchema);

//----------------------------------------------------------------------------------------------------------

// import sql from 'mssql';

// const config: sql.config = {
//     server: 'DESKTOP-TOL96KV\\SQLEXPRESS',
//     database: 'CRUD',
//     authentication: {
//         type: 'default',
//         options: {
//             userName: '',
//             password: ''
//         }
//     },
//     options: {
//         trustServerCertificate: true,
//         enableArithAbort: true,
//         encrypt: false
//     },
//     pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 30000
//     }
// };

// export const connectionPool = new sql.ConnectionPool(config)
//     .connect()
//     .then((pool) => {
//         console.log('SQL Server Connected Successfully');
//         return pool;
//     })
//     .catch((err) => {
//         console.log('SQL Server Connection Failed');
//         console.error('Error name:', err.name);
//         console.error('Error message:', err.message);
//         console.error('Error code:', err.code);
//         console.error('Original error:', err.originalError);
//         throw err;
//     });

