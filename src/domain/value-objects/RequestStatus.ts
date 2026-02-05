/**
 * Request Status Value Object
 * Represents the lifecycle states of a client request
 */
export enum RequestStatus {
  NEW = 'NEW',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

/**
 * Legacy status mapping for backward compatibility
 * Existing records may have 'ESTIMATED' status which maps to PENDING_APPROVAL
 */
export const LEGACY_STATUS_MAP: Record<string, RequestStatus> = {
  'ESTIMATED': RequestStatus.PENDING_APPROVAL
};

/**
 * Normalize a status value, handling legacy statuses
 */
export function normalizeStatus(status: string): RequestStatus {
  if (LEGACY_STATUS_MAP[status]) {
    return LEGACY_STATUS_MAP[status];
  }
  return status as RequestStatus;
}

export const REQUEST_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.NEW]: [RequestStatus.PENDING_APPROVAL],
  [RequestStatus.PENDING_APPROVAL]: [RequestStatus.APPROVED, RequestStatus.REJECTED],
  [RequestStatus.APPROVED]: [],
  [RequestStatus.REJECTED]: []
};

export function isValidStatusTransition(from: RequestStatus, to: RequestStatus): boolean {
  return REQUEST_STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalStatus(status: RequestStatus): boolean {
  return status === RequestStatus.APPROVED || status === RequestStatus.REJECTED;
}
