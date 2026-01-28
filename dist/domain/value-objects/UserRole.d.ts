/**
 * User Role Value Object
 * Defines the roles and their permissions in the system
 */
export declare enum UserRole {
    CLIENT = "CLIENT",
    INTERNAL = "INTERNAL",
    APPROVER = "APPROVER"
}
export declare enum Permission {
    CREATE_REQUEST = "CREATE_REQUEST",
    VIEW_OWN_REQUESTS = "VIEW_OWN_REQUESTS",
    VIEW_ALL_REQUESTS = "VIEW_ALL_REQUESTS",
    ESTIMATE_REQUEST = "ESTIMATE_REQUEST",
    APPROVE_REQUEST = "APPROVE_REQUEST",
    REJECT_REQUEST = "REJECT_REQUEST"
}
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
export declare function hasPermission(role: UserRole, permission: Permission): boolean;
export declare function isValidRole(role: string): role is UserRole;
//# sourceMappingURL=UserRole.d.ts.map