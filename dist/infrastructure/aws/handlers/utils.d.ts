import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserContext } from '../../../shared/middleware/auth';
import { AppError } from '../../../shared/errors';
/**
 * Create a successful JSON response
 */
export declare function createSuccessResponse(statusCode: number, body: unknown, origin?: string): APIGatewayProxyResult;
/**
 * Create an error response
 */
export declare function createErrorResponse(error: Error | AppError, origin?: string): APIGatewayProxyResult;
/**
 * Handler wrapper that provides common functionality
 */
export declare function withHandler(event: APIGatewayProxyEvent, handler: (event: APIGatewayProxyEvent, userContext: UserContext) => Promise<APIGatewayProxyResult>): Promise<APIGatewayProxyResult>;
/**
 * Parse JSON body from event
 */
export declare function parseBody<T>(event: APIGatewayProxyEvent): T;
/**
 * Get path parameter
 */
export declare function getPathParameter(event: APIGatewayProxyEvent, name: string): string;
//# sourceMappingURL=utils.d.ts.map