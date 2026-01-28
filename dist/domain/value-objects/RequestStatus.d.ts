/**
 * Request Status Value Object
 * Represents the lifecycle states of a client request
 */
export declare enum RequestStatus {
    NEW = "NEW",
    ESTIMATED = "ESTIMATED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare const REQUEST_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]>;
export declare function isValidStatusTransition(from: RequestStatus, to: RequestStatus): boolean;
export declare function isTerminalStatus(status: RequestStatus): boolean;
//# sourceMappingURL=RequestStatus.d.ts.map