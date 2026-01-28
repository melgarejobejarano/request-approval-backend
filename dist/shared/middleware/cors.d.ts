import { APIGatewayProxyResult } from 'aws-lambda';
/**
 * CORS Headers Generator
 * Generates appropriate CORS headers based on configuration
 */
export declare function getCorsHeaders(origin?: string): Record<string, string>;
/**
 * Create CORS preflight response
 */
export declare function createCorsPreflightResponse(origin?: string): APIGatewayProxyResult;
/**
 * Add CORS headers to response
 */
export declare function addCorsHeaders(response: APIGatewayProxyResult, origin?: string): APIGatewayProxyResult;
//# sourceMappingURL=cors.d.ts.map