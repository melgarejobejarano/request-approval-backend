"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_STATUS_TRANSITIONS = exports.LEGACY_STATUS_MAP = exports.RequestStatus = void 0;
exports.normalizeStatus = normalizeStatus;
exports.isValidStatusTransition = isValidStatusTransition;
exports.isTerminalStatus = isTerminalStatus;
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
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
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
    [RequestStatus.NEW]: [RequestStatus.PENDING_APPROVAL],
    [RequestStatus.PENDING_APPROVAL]: [RequestStatus.APPROVED, RequestStatus.REJECTED],
    [RequestStatus.APPROVED]: [],
    [RequestStatus.REJECTED]: []
};
function isValidStatusTransition(from, to) {
    return exports.REQUEST_STATUS_TRANSITIONS[from].includes(to);
}
function isTerminalStatus(status) {
    return status === RequestStatus.APPROVED || status === RequestStatus.REJECTED;
}
//# sourceMappingURL=RequestStatus.js.map