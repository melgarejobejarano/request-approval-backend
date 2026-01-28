import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * Create Request Lambda Handler
 * POST /requests
 *
 * Required headers:
 * - X-User-Id: Client's user ID
 * - X-User-Role: Must be CLIENT
 * - X-User-Name: Client's display name
 *
 * Request body:
 * {
 *   "title": "Request title",
 *   "description": "Request description"
 * }
 */
export declare const handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
//# sourceMappingURL=createRequest.d.ts.map