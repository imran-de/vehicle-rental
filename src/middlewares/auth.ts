import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../utils/AppError';
import { TUserRole } from '../modules/auth/auth.interface';
import catchAsync from '../utils/catchAsync';
import pool from '../config/db';

const auth = (...requiredRoles: TUserRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;

        // checking if the token is missing
        if (!token) {
            throw new AppError(401, 'You are not authorized!');
        }

        const splitToken = token.split(' ')[1];

        // checking if the given token is valid
        const decoded = jwt.verify(
            splitToken,
            config.jwt_secret as string,
        ) as JwtPayload;

        const { role, email } = decoded;

        // checking if the user is exist
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            throw new AppError(404, 'This user is not found !');
        }

        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new AppError(
                401,
                'You are not authorized',
            );
        }

        req.user = decoded as JwtPayload;
        next();
    });
};

export default auth;
