import { APIGatewayProxyEvent } from 'aws-lambda';
import { UserRole, isValidRole } from '../../domain/value-objects/UserRole';
import { UnauthorizedError } from '../errors';

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
export function extractUserContext(event: APIGatewayProxyEvent): UserContext {
  const headers = event.headers;

  // Case-insensitive header access
  const userId = headers['X-User-Id'] || headers['x-user-id'];
  const userRole = headers['X-User-Role'] || headers['x-user-role'];
  const userName = headers['X-User-Name'] || headers['x-user-name'];

  if (!userId) {
    throw new UnauthorizedError('Missing required header: X-User-Id');
  }

  if (!userRole) {
    throw new UnauthorizedError('Missing required header: X-User-Role');
  }

  if (!isValidRole(userRole.toUpperCase())) {
    throw new UnauthorizedError(`Invalid user role: ${userRole}`);
  }

  return {
    userId,
    userRole: userRole.toUpperCase() as UserRole,
    userName: userName || userId
  };
}

/**
 * Require specific role for an operation
 */
export function requireRole(userContext: UserContext, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(userContext.userRole)) {
    throw new UnauthorizedError(
      `Access denied. Required role: ${allowedRoles.join(' or ')}`
    );
  }
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userContext: UserContext, roles: UserRole[]): boolean {
  return roles.includes(userContext.userRole);
}
