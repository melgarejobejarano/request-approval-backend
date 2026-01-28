"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
exports.withHandler = withHandler;
exports.parseBody = parseBody;
exports.getPathParameter = getPathParameter;
const cors_1 = require("../../../shared/middleware/cors");
const auth_1 = require("../../../shared/middleware/auth");
const errors_1 = require("../../../shared/errors");
/**
 * Create a successful JSON response
 */
function createSuccessResponse(statusCode, body, origin) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...(0, cors_1.getCorsHeaders)(origin)
        },
        body: JSON.stringify(body)
    };
}
/**
 * Create an error response
 */
function createErrorResponse(error, origin) {
    const statusCode = (0, errors_1.getStatusCode)(error);
    const errorResponse = (0, errors_1.toErrorResponse)(error);
    // Log error for debugging
    console.error('Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
    });
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...(0, cors_1.getCorsHeaders)(origin)
        },
        body: JSON.stringify(errorResponse)
    };
}
/**
 * Handler wrapper that provides common functionality
 */
async function withHandler(event, handler) {
    const origin = event.headers['origin'] || event.headers['Origin'];
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return (0, cors_1.createCorsPreflightResponse)(origin);
    }
    try {
        // Extract user context from headers
        const userContext = (0, auth_1.extractUserContext)(event);
        // Execute the handler
        return await handler(event, userContext);
    }
    catch (error) {
        return createErrorResponse(error, origin);
    }
}
/**
 * Parse JSON body from event
 */
function parseBody(event) {
    if (!event.body) {
        throw new errors_1.AppError('Request body is required', 400);
    }
    try {
        return JSON.parse(event.body);
    }
    catch {
        throw new errors_1.AppError('Invalid JSON in request body', 400);
    }
}
/**
 * Get path parameter
 */
function getPathParameter(event, name) {
    const value = event.pathParameters?.[name];
    if (!value) {
        throw new errors_1.AppError(`Missing path parameter: ${name}`, 400);
    }
    return value;
}
//# sourceMappingURL=utils.js.map