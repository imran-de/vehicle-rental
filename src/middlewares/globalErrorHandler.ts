import { ErrorRequestHandler } from 'express';

import config from '../config';
import AppError from '../utils/AppError';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorSources = [{ path: req.originalUrl, message: 'Something went wrong' }];

    if (err instanceof SyntaxError) {
        statusCode = 400;
        message = 'Invalid JSON';
        errorSources = [
            {
                path: req.originalUrl,
                message: err?.message,
            },
        ];
    } else if (err?.code === '23505') { // Postgres unique violation code
        statusCode = 400;
        message = 'Duplicate Entry';
        const match = err.detail.match(/Key \((.*?)\)=/);
        const field = match ? match[1] : 'Value';
        errorSources = [
            {
                path: req.originalUrl,
                message: `${field} already exists`,
            },
        ];
    } else if (err instanceof AppError) {
        statusCode = err?.statusCode;
        message = err.message;
        errorSources = [
            {
                path: err?.path || req.originalUrl,
                message: err?.message,
            },
        ];
    } else if (err instanceof Error) {
        message = err.message;
        errorSources = [
            {
                path: req.originalUrl,
                message: err?.message,
            },
        ];
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: { statusCode },
        stack: config.env === 'development' ? err?.stack : null,
    });
};

export default globalErrorHandler;
