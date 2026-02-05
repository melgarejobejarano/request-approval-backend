"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_STATUS_TRANSITIONS = exports.LEGACY_STATUS_MAP = exports.ACTIVE_STATUSES = exports.RequestStatus = void 0;
exports.normalizeStatus = normalizeStatus;
exports.isValidStatusTransition = isValidStatusTransition;
exports.isTerminalStatus = isTerminalStatus;
exports.isCanceledStatus = isCanceledStatus;
/**
 * Request Status Value Object
 * Represents the lifecycle states of a client request
 */
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["NEW"] = "NEW";
    RequestStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    RequestStatus["APPROVED"] = "APPROVED";
    RequestStatus["REJECTED"] = "REJECTED";
    RequestStatus["CANCELED"] = "CANCELED";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
/**
 * Active statuses (excludes CANCELED)
 * Used by API and UI to filter out canceled requests
 */
exports.ACTIVE_STATUSES = [
    RequestStatus.NEW,
    RequestStatus.PENDING_APPROVAL,
    RequestStatus.APPROVED,
    RequestStatus.REJECTED
];
/**
 * Legacy status mapping for backward compatibility
 * Existing records may have 'ESTIMATED' status which maps to PENDING_APPROVAL
 */
exports.LEGACY_STATUS_MAP = {
    'ESTIMATED': RequestStatus.PENDING_APPROVAL
};
/**
 * Normalize a status value, handling legacy statuses
 */
function normalizeStatus(status) {
    if (exports.LEGACY_STATUS_MAP[status]) {
        return exports.LEGACY_STATUS_MAP[status];
    }
    return status;
}
exports.REQUEST_STATUS_TRANSITIONS = {
    [RequestStatus.NEW]: [RequestStatus.PENDING_APPROVAL, RequestStatus.CANCELED],
    [RequestStatus.PENDING_APPROVAL]: [RequestStatus.APPROVED, RequestStatus.REJECTED, RequestStatus.CANCELED],
    [RequestStatus.APPROVED]: [],
    [RequestStatus.REJECTED]: [],
    [RequestStatus.CANCELED]: []
};
function isValidStatusTransition(from, to) {
    return exports.REQUEST_STATUS_TRANSITIONS[from].includes(to);
}
function isTerminalStatus(status) {
    return status === RequestStatus.APPROVED || status === RequestStatus.REJECTED || status === RequestStatus.CANCELED;
}
/**
 * Check if a status is canceled
 */
function isCanceledStatus(status) {
    return status === RequestStatus.CANCELED;
}
//# sourceMappingURL=RequestStatus.js.map