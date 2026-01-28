import { APIGatewayProxyEvent } from 'aws-lambda';
import { UserRole } from '../../domain/value-objects/UserRole';
/**
 * User context extracted from request
 */
export interface UserContext {
    userId: string;
    userRole: UserRole;
    userName: string;
}
/**
 * Extract user context from request headers
 *
 * In production, this would typically:
 * 1. Extract JWT from Authorization header
 * 2. Validate and decode the token
 * 3. Extract user info from token claims
 *
 * For this implementation, we use custom headers for simplicity:
 * - X-User-Id: User's unique identifier
 * - X-User-Role: User's role (CLIENT, INTERNAL, APPROVER)
 * - X-User-Name: User's display name
 */
export declare function extractUserContext(event: APIGatewayProxyEvent): UserContext;
/**
 * Require specific role for an operation
 */
export declare function requireRole(userContext: UserContext, allowedRoles: UserRole[]): void;
/**
 * Check if user has any of the specified roles
 */
export declare function hasAnyRole(userContext: UserContext, roles: UserRole[]): boolean;
//# sourceMappingURL=auth.d.ts.map