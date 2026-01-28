"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalServiceError = exports.InternalError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
exports.toErrorResponse = toErrorResponse;
exports.getStatusCode = getStatusCode;
/**
 * Base Application Error
 */
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Validation Error - 400 Bad Request
 */
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
/**
 * Unauthorized Error - 401 Unauthorized
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * Forbidden Error - 403 Forbidden
 */
class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * Not Found Error - 404 Not Found
 */
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Conflict Error - 409 Conflict
 */
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
/**
 * Internal Server Error - 500
 */
class InternalError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, false);
    }
}
exports.InternalError = InternalError;
/**
 * External Service Error - 502 Bad Gateway
 */
class ExternalServiceError extends AppError {
    constructor(service, message) {
        super(`${service} error: ${message}`, 502);
    }
}
exports.ExternalServiceError = ExternalServiceError;
/**
 * Convert error to API response format
 */
function toErrorResponse(error) {
    if (error instanceof AppError) {
        return {
            error: {
                code: error.constructor.name.replace('Error', '').toUpperCase(),
                message: error.message
            }
        };
    }
    return {
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
        }
    };
}
/**
 * Get HTTP status code from error
 */
function getStatusCode(error) {
    if (error instanceof AppError) {
        return error.statusCode;
    }
    return 500;
}
//# sourceMappingURL=index.js.map