import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * Cancel Request Lambda Handler
 * PATCH /requests/{id}/cancel
 *
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: Any valid role
 * - X-User-Name: User's display name
 *
 * Path parameters:
 * - id: Request ID
 *
 * Request body (optional):
 * {
 *   "reason": "Optional cancellation reason"
 * }
 *
 * Design:
 * - Always returns 200 if DynamoDB update succeeds
 * - Jira updates are best-effort (failures logged, not thrown)
 * - Cancel is idempotent (succeeds if already canceled)
 */
export declare const handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
//# sourceMappingURL=cancelRequest.d.ts.map