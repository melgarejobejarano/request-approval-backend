"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCorsHeaders = getCorsHeaders;
exports.createCorsPreflightResponse = createCorsPreflightResponse;
exports.addCorsHeaders = addCorsHeaders;
const config_1 = require("../config");
/**
 * CORS Headers Generator
 * Generates appropriate CORS headers based on configuration
 */
function getCorsHeaders(origin) {
    const config = (0, config_1.getConfig)();
    const allowedOrigins = config.cors.allowedOrigins;
    // Determine the origin to allow
    let allowedOrigin = '*';
    if (origin && allowedOrigins.length > 0) {
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            allowedOrigin = origin;
        }
        else {
            // If origin not in allowed list, use first allowed origin
            allowedOrigin = allowedOrigins[0];
        }
    }
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Id,X-User-Role,X-User-Name',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
    };
}
/**
 * Create CORS preflight response
 */
function createCorsPreflightResponse(origin) {
    return {
        statusCode: 200,
        headers: getCorsHeaders(origin),
        body: ''
    };
}
/**
 * Add CORS headers to response
 */
function addCorsHeaders(response, origin) {
    return {
        ...response,
        headers: {
            ...response.headers,
            ...getCorsHeaders(origin)
        }
    };
}
//# sourceMappingURL=cors.js.map