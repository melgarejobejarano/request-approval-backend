/**
 * Request Status Value Object
 * Represents the lifecycle states of a client request
 */
export enum RequestStatus {
  NEW = 'NEW',
  ESTIMATED = 'ESTIMATED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const REQUEST_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.NEW]: [RequestStatus.ESTIMATED],
  [RequestStatus.ESTIMATED]: [RequestStatus.APPROVED, RequestStatus.REJECTED],
  [RequestStatus.APPROVED]: [],
  [RequestStatus.REJECTED]: []
};

export function isValidStatusTransition(from: RequestStatus, to: RequestStatus): boolean {
  return REQUEST_STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalStatus(status: RequestStatus): boolean {
  return status === RequestStatus.APPROVED || status === RequestStatus.REJECTED;
}
