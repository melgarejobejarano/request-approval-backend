/**
 * Base Application Error
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
/**
 * Validation Error - 400 Bad Request
 */
export declare class ValidationError extends AppError {
    constructor(message: string);
}
/**
 * Unauthorized Error - 401 Unauthorized
 */
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
/**
 * Forbidden Error - 403 Forbidden
 */
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
/**
 * Not Found Error - 404 Not Found
 */
export declare class NotFoundError extends AppError {
    constructor(message: string);
}
/**
 * Conflict Error - 409 Conflict
 */
export declare class ConflictError extends AppError {
    constructor(message: string);
}
/**
 * Internal Server Error - 500
 */
export declare class InternalError extends AppError {
    constructor(message?: string);
}
/**
 * External Service Error - 502 Bad Gateway
 */
export declare class ExternalServiceError extends AppError {
    constructor(service: string, message: string);
}
/**
 * Error response format for API
 */
export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}
/**
 * Convert error to API response format
 */
export declare function toErrorResponse(error: Error | AppError): ErrorResponse;
/**
 * Get HTTP status code from error
 */
export declare function getStatusCode(error: Error | AppError): number;
//# sourceMappingURL=index.d.ts.map