import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * Approve/Reject Request Lambda Handler
 * PATCH /requests/{id}/approve
 *
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: Any valid role (MVP: role gating disabled)
 * - X-User-Name: User's display name (e.g., "Jules")
 *
 * Path parameters:
 * - id: Request ID
 *
 * Request body:
 * {
 *   "action": "approve" | "reject",
 *   "comment": "Optional comment (required for rejection)"
 * }
 */
export declare const handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
//# sourceMappingURL=approveRequest.d.ts.map