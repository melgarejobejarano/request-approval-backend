/**
 * Request Status Value Object
 * Represents the lifecycle states of a client request
 */
export declare enum RequestStatus {
    NEW = "NEW",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
/**
 * Legacy status mapping for backward compatibility
 * Existing records may have 'ESTIMATED' status which maps to PENDING_APPROVAL
 */
export declare const LEGACY_STATUS_MAP: Record<string, RequestStatus>;
/**
 * Normalize a status value, handling legacy statuses
 */
export declare function normalizeStatus(status: string): RequestStatus;
export declare const REQUEST_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]>;
export declare function isValidStatusTransition(from: RequestStatus, to: RequestStatus): boolean;
export declare function isTerminalStatus(status: RequestStatus): boolean;
//# sourceMappingURL=RequestStatus.d.ts.map