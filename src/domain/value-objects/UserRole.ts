/**
 * User Role Value Object
 * Defines the roles and their permissions in the system
 */
export enum UserRole {
  CLIENT = 'CLIENT',
  INTERNAL = 'INTERNAL',
  APPROVER = 'APPROVER'
}

export enum Permission {
  CREATE_REQUEST = 'CREATE_REQUEST',
  VIEW_OWN_REQUESTS = 'VIEW_OWN_REQUESTS',
  VIEW_ALL_REQUESTS = 'VIEW_ALL_REQUESTS',
  ESTIMATE_REQUEST = 'ESTIMATE_REQUEST',
  APPROVE_REQUEST = 'APPROVE_REQUEST',
  REJECT_REQUEST = 'REJECT_REQUEST'
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}
