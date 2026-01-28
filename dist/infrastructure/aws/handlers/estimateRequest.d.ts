import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * Estimate Request Lambda Handler
 * PATCH /requests/{id}/estimate
 *
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: Must be INTERNAL
 * - X-User-Name: User's display name
 *
 * Path parameters:
 * - id: Request ID
 *
 * Request body:
 * {
 *   "estimated_days": 5,
 *   "comment": "Estimation notes"
 * }
 */
export declare const handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
//# sourceMappingURL=estimateRequest.d.ts.map