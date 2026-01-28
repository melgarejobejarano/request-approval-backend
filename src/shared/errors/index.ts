/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Unauthorized Error - 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden Error - 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
  }
}

/**
 * Not Found Error - 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

/**
 * Conflict Error - 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Internal Server Error - 500
 */
export class InternalError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, false);
  }
}

/**
 * External Service Error - 502 Bad Gateway
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, 502);
  }
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
export function toErrorResponse(error: Error | AppError): ErrorResponse {
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
export function getStatusCode(error: Error | AppError): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}
