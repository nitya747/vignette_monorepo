import { logger } from '../utils/logger.js';
export class AppError extends Error {
    statusCode;
    details;
    constructor(message, statusCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class ValidationError extends AppError {
    constructor(details, message = 'Validation failed') {
        super(message, 400, details);
    }
}
export class AuthError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}
export class ProviderError extends AppError {
    constructor(message, details) {
        super(message, 502, details);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
export function errorHandler(err, req, res, next) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    const details = err instanceof AppError ? err.details : undefined;
    // Log error using dynamic Pino logger
    logger.error({
        msg: 'Express Request Error',
        error: err.message,
        stack: err.stack,
        statusCode,
        path: req.path,
        method: req.method
    });
    res.status(statusCode).json({
        error: message,
        statusCode,
        details: details || null,
        timestamp: new Date().toISOString()
    });
}
