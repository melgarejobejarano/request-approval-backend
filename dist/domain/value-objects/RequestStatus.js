"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_STATUS_TRANSITIONS = exports.RequestStatus = void 0;
exports.isValidStatusTransition = isValidStatusTransition;
exports.isTerminalStatus = isTerminalStatus;
/**
 * Request Status Value Object
 * Represents the lifecycle states of a client request
 */
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["NEW"] = "NEW";
    RequestStatus["ESTIMATED"] = "ESTIMATED";
    RequestStatus["APPROVED"] = "APPROVED";
    RequestStatus["REJECTED"] = "REJECTED";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
exports.REQUEST_STATUS_TRANSITIONS = {
    [RequestStatus.NEW]: [RequestStatus.ESTIMATED],
    [RequestStatus.ESTIMATED]: [RequestStatus.APPROVED, RequestStatus.REJECTED],
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