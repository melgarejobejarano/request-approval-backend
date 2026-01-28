import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * Get Request By ID Lambda Handler
 * GET /requests/{id}
 *
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: CLIENT, INTERNAL, or APPROVER
 * - X-User-Name: User's display name
 *
 * Path parameters:
 * - id: Request ID
 *
 * Returns:
 * - CLIENT: Only if they own the request
 * - INTERNAL/APPROVER: Any request
 */
export declare const handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
//# sourceMappingURL=getRequestById.d.ts.map