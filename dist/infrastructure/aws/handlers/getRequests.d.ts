import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * Get Requests Lambda Handler
 * GET /requests
 *
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: CLIENT, INTERNAL, or APPROVER
 * - X-User-Name: User's display name
 *
 * Returns:
 * - CLIENT: Only their own requests
 * - INTERNAL/APPROVER: All requests
 */
export declare const handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
//# sourceMappingURL=getRequests.d.ts.map