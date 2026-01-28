"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUserContext = extractUserContext;
exports.requireRole = requireRole;
exports.hasAnyRole = hasAnyRole;
const UserRole_1 = require("../../domain/value-objects/UserRole");
const errors_1 = require("../errors");
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
function extractUserContext(event) {
    const headers = event.headers;
    // Case-insensitive header access
    const userId = headers['X-User-Id'] || headers['x-user-id'];
    const userRole = headers['X-User-Role'] || headers['x-user-role'];
    const userName = headers['X-User-Name'] || headers['x-user-name'];
    if (!userId) {
        throw new errors_1.UnauthorizedError('Missing required header: X-User-Id');
    }
    if (!userRole) {
        throw new errors_1.UnauthorizedError('Missing required header: X-User-Role');
    }
    if (!(0, UserRole_1.isValidRole)(userRole.toUpperCase())) {
        throw new errors_1.UnauthorizedError(`Invalid user role: ${userRole}`);
    }
    return {
        userId,
        userRole: userRole.toUpperCase(),
        userName: userName || userId
    };
}
/**
 * Require specific role for an operation
 */
function requireRole(userContext, allowedRoles) {
    if (!allowedRoles.includes(userContext.userRole)) {
        throw new errors_1.UnauthorizedError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }
}
/**
 * Check if user has any of the specified roles
 */
function hasAnyRole(userContext, roles) {
    return roles.includes(userContext.userRole);
}
//# sourceMappingURL=auth.js.map