"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.Permission = exports.UserRole = void 0;
exports.hasPermission = hasPermission;
exports.isValidRole = isValidRole;
/**
 * User Role Value Object
 * Defines the roles and their permissions in the system
 */
var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "CLIENT";
    UserRole["INTERNAL"] = "INTERNAL";
    UserRole["APPROVER"] = "APPROVER";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    Permission["CREATE_REQUEST"] = "CREATE_REQUEST";
    Permission["VIEW_OWN_REQUESTS"] = "VIEW_OWN_REQUESTS";
    Permission["VIEW_ALL_REQUESTS"] = "VIEW_ALL_REQUESTS";
    Permission["ESTIMATE_REQUEST"] = "ESTIMATE_REQUEST";
    Permission["APPROVE_REQUEST"] = "APPROVE_REQUEST";
    Permission["REJECT_REQUEST"] = "REJECT_REQUEST";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_PERMISSIONS = {
    [UserRole.CLIENT]: [
        Permission.CREATE_REQUEST,
        Permission.VIEW_OWN_REQUESTS
    ],
    [UserRole.INTERNAL]: [
        Permission.VIEW_ALL_REQUESTS,
        Permission.ESTIMATE_REQUEST
    ],
    [UserRole.APPROVER]: [
        Permission.VIEW_ALL_REQUESTS,
        Permission.APPROVE_REQUEST,
        Permission.REJECT_REQUEST
    ]
};
function hasPermission(role, permission) {
    return exports.ROLE_PERMISSIONS[role].includes(permission);
}
function isValidRole(role) {
    return Object.values(UserRole).includes(role);
}
//# sourceMappingURL=UserRole.js.map