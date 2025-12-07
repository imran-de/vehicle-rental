import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/db';
import config from '../../config';
import AppError from '../../utils/AppError';
import { TUser } from './auth.interface';

const signup = async (payload: TUser) => {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [payload.email]);

    if (existingUser.rowCount && existingUser.rowCount > 0) {
        throw new AppError(400, 'User already exists with this email!');
    }

    const hashedPassword = await bcrypt.hash(
        payload.password as string,
        Number(config.bcrypt_salt_rounds),
    );

    const result = await pool.query(
        `INSERT INTO users (name, email, password, phone, role, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING id, name, email, phone, role`,
        [payload.name, payload.email, hashedPassword, payload.phone, payload.role || 'customer']
    );

    return result.rows[0];
};

const signin = async (payload: Pick<TUser, 'email' | 'password'>) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [payload.email]);
    const user = result.rows[0];

    if (!user) {
        throw new AppError(404, 'User not found!');
    }

    const isPasswordMatched = await bcrypt.compare(
        payload.password as string,
        user.password,
    );

    if (!isPasswordMatched) {
        throw new AppError(401, 'Invalid password!');
    }

    const jwtPayload = {
        email: user.email,
        role: user.role,
        id: user.id,
    };

    const token = jwt.sign(jwtPayload, config.jwt_secret as string, {
        expiresIn: '30d',
    });

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        },
    };
};

export const AuthService = {
    signup,
    signin,
};
